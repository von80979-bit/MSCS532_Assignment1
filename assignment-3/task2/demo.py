"""Demonstration of the chaining hash table: insert, search, delete, collision handling, and dynamic resizing driven by the load factor."""

from task2.hash_table import HashTable


def run_task2():
    table = HashTable()
    _demonstrate_insert_and_search(table)
    _demonstrate_update(table)
    _demonstrate_delete(table)
    _demonstrate_dynamic_resizing()


def _demonstrate_insert_and_search(table):
    print("\n=== Insert and search ===")
    sample_pairs = [
        ("apple", 1.25),
        ("banana", 0.50),
        ("cherry", 3.00),
        (2024, "integer keys work too"),
    ]
    for key, value in sample_pairs:
        table.insert(key, value)
        print(f"  inserted {key!r} -> {value!r}")
    print(f"  search('banana') = {table.search('banana')!r}")
    print(f"  search(2024)     = {table.search(2024)!r}")
    _report_missing_key(table, "durian")


def _demonstrate_update(table):
    print("\n=== Insert with an existing key updates the value ===")
    print(f"  before: search('apple') = {table.search('apple')!r}")
    table.insert("apple", 1.75)
    print(f"  after:  search('apple') = {table.search('apple')!r}")
    print(f"  element count is still {len(table)}")


def _demonstrate_delete(table):
    print("\n=== Delete ===")
    print(f"  There are {len(table)} element in the table")
    table.delete("cherry")
    print("  deleted 'cherry'")
    _report_missing_key(table, "cherry")
    print(f"  element count is now {len(table)}")


def _demonstrate_dynamic_resizing():
    print("\n=== Dynamic resizing keeps the load factor low ===")
    table = HashTable()
    print(f"  {'inserted':>8} | {'slots':>5} | {'load factor':>11}")
    for inserted_count in range(1, 101):
        table.insert(inserted_count, f"value-{inserted_count}")
        if inserted_count in (1, 6, 12, 24, 48, 96, 100):
            print(
                f"  {inserted_count:>8} | {table.slot_count:>5} | {table.load_factor:>11.3f}"
            )
    all_keys_survive_rehashing = all(
        table.search(key) == f"value-{key}" for key in range(1, 101)
    )
    print(f"  all 100 keys retrievable after rehashing: {all_keys_survive_rehashing}")


def _report_missing_key(table, key):
    try:
        table.search(key)
    except KeyError:
        print(f"  search({key!r}) raises KeyError (not in table)")


if __name__ == "__main__":
    run_task2()
