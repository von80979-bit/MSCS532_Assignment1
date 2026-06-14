"""Task: the unit of work scheduled by the priority queue.

A task carries the attributes the scheduler reasons about. Priority drives the ordering, arrival time breaks ties, and
the deadline is recorded for reporting even though it does not affect the order, since the caller controls when a task
enters the queue.
"""


class Task:
    def __init__(self, task_id, priority, arrival_time, deadline):
        self.task_id = task_id
        self.priority = priority
        self.arrival_time = arrival_time
        self.deadline = deadline

    def outranks(self, other):
        """Return True when this task should sit above other in the max-heap.

        A higher priority always wins. When two tasks share a priority, the earlier arrival time wins, so equal-priority
        tasks leave the queue in the order they arrived, which matches plain queue behavior.
        """
        if self.priority != other.priority:
            return self.priority > other.priority
        return self.arrival_time < other.arrival_time

    def __repr__(self):
        return (
            f"Task(id={self.task_id}, priority={self.priority}, "
            f"arrival={self.arrival_time}, deadline={self.deadline})"
        )
