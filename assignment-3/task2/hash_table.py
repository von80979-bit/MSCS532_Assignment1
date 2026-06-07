"""Hash table with chaining for collision resolution.

The slot for a key is computed by a hash function drawn at random from the universal family (CLRS Section 11.3.4):

    h(k) = ((a * k + b) mod p) mod m

where p is a prime larger than any key value, a is random in [1, p - 1], b is random in [0, p - 1], and m is the number of slots.
Picking a and b at random guarantees that any two distinct keys collide with probability at most 1/m, no matter what keys the caller uses.
"""

import random

# The prime p of the universal family: Mersenne prime 2^61 - 1,
# comfortably larger than the integer encoding of any practical key.
LARGE_PRIME = (1 << 61) - 1

INITIAL_SLOT_COUNT = 8
MAX_LOAD_FACTOR = 0.75
GROWTH_FACTOR = 2


class HashTable:
    def __init__(self):
        # Each slot holds a chain (a list) of (key, value) pairs.
        # Keys that hash to the same slot live together in that chain.
        self._slots = [[] for _ in range(INITIAL_SLOT_COUNT)]
        self._element_count = 0
        self._pick_random_hash_function()

    def insert(self, key, value):
        """Add a key-value pair; overwrite the value if the key exists."""
        # Step 1: hash the key to find the only chain it can live in.
        slot_index = self._hash_key_to_slot_index(key)
        chain = self._slots[slot_index]

        # Step 2: if the key is already in the chain, update it in place.
        for pair_position, (existing_key, _) in enumerate(chain):
            if existing_key == key:
                chain[pair_position] = (key, value)
                return

        # Step 3: new key, append the pair to the chain.
        chain.append((key, value))
        self._element_count += 1

        # Step 4: grow the table if the chains are getting too long.
        if self.load_factor > MAX_LOAD_FACTOR:
            self._resize()

    def search(self, key):
        """Return the value stored for the key, or raise KeyError."""
        # Step 1: hash the key, jump straight to its chain.
        slot_index = self._hash_key_to_slot_index(key)

        # Step 2: scan the chain slot to find the key.
        for existing_key, value in self._slots[slot_index]:
            if existing_key == key:
                return value
        raise KeyError(key)

    def delete(self, key):
        """Remove the key-value pair for the key, or raise KeyError."""
        # Step 1: hash the key, jump straight to its chain.
        slot_index = self._hash_key_to_slot_index(key)
        chain = self._slots[slot_index]

        # Step 2: unlink the pair from the chain if present.
        for pair_position, (existing_key, _) in enumerate(chain):
            if existing_key == key:
                del chain[pair_position]
                self._element_count -= 1
                return
        raise KeyError(key)

    @property
    def load_factor(self):
        """alpha = n / m: the average chain length under uniform hashing."""
        return self._element_count / len(self._slots)

    @property
    def slot_count(self):
        return len(self._slots)

    def __len__(self):
        return self._element_count

    def _hash_key_to_slot_index(self, key):
        """Apply the universal hash function h(k) = ((a*k + b) mod p) mod m.

        The key determines the slot. The same key always maps to the same slot while a and b stay fixed, which is what makes
        a later search or delete find the pair again.
        """
        integer_key = _key_to_integer(key)
        a, b = self._multiplier, self._offset
        return ((a * integer_key + b) % LARGE_PRIME) % len(self._slots)

    def _pick_random_hash_function(self):
        """Draw a and b at random, selecting one member of the universal family. Called once per table and again on every resize."""
        self._multiplier = random.randint(1, LARGE_PRIME - 1)
        self._offset = random.randint(0, LARGE_PRIME - 1)

    def _resize(self):
        """Double the slot count and rehash every pair with a freshly drawn hash function, restoring a low load factor so chains stay
        short and operations stay O(1) on average."""
        existing_pairs = [pair for chain in self._slots for pair in chain]
        self._slots = [[] for _ in range(len(self._slots) * GROWTH_FACTOR)]
        # A new m needs a new hash function; reusing the old a and b
        # would also keep any unlucky clustering alive.
        self._pick_random_hash_function()
        for key, value in existing_pairs:
            slot_index = self._hash_key_to_slot_index(key)
            self._slots[slot_index].append((key, value))


def _key_to_integer(key):
    """Map a key into the integer universe [0, p) that the universal family hashes. Strings are encoded byte by byte into one integer."""
    if isinstance(key, int):
        return key % LARGE_PRIME
    if isinstance(key, str):
        return int.from_bytes(key.encode("utf-8"), "big") % LARGE_PRIME
    raise TypeError(f"Unsupported key type: {type(key).__name__}")
