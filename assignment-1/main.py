import random


def insertionSort(items, direction):
    for i in range(1, len(items)):
        current = items[i]
        pointer = i - 1
        while pointer >= 0:
            item = items[pointer]
            satisfy = item < current if direction == "desc" else item > current
            if satisfy:
                items[pointer + 1] = item
                pointer -= 1
            else:
                break
        items[pointer + 1] = current

    return items


if __name__ == "__main__":
    nums = random.sample(range(1, 101), 10)
    print("Original list: ", nums)
    print("Sorted list in desc: ", insertionSort(nums, "desc"))
