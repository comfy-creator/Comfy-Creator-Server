import threading

# Shared state
class SharedState:
    def __init__(self, initial_value):
        self.value = initial_value
        self.lock = threading.Lock()

    def read_value(self):
        with self.lock:
            return self.value

    def write_value(self, new_value):
        with self.lock:
            self.value = new_value

# Function definitions
def function_A(state):
    value = state.read_value()
    print(f"Function A reads S = {value}")
    return None  # Explicitly return None to match the new pattern

def function_B(state):
    value = state.read_value()
    new_value = value + 10  # Simulate some operation
    state.write_value(new_value)
    print(f"Function B updates S to {new_value}")
    return new_value  # Return the new value

def function_C(state):
    value = state.read_value()
    print(f"Function C reads S = {value}")
    return None  # Explicitly return None to match the new pattern

def function_D(state, b_output):  # Accept output from B as an additional parameter
    print(f"Function D reads S = {state.read_value()} and B's output = {b_output}")

# Executor logic
class Executor:
    def __init__(self):
        self.tasks = {}
        self.lock = threading.Lock()
        self.condition = threading.Condition(self.lock)
        self.results = {}  # Store results of tasks

    def add_task(self, function, name, dependencies):
        self.tasks[name] = {"function": function, "dependencies": set(dependencies), "done": False}

    def run_task(self, name, state):
        with self.lock:
            task = self.tasks[name]
            while task["dependencies"]:
                # Wait until all dependencies are resolved
                self.condition.wait()
            # Execute the task, capturing output if any
            if name == "D":  # Special handling for function D to pass B's output
                b_output = self.results.get("B", None)  # Get B's output from results
                output = task["function"](state, b_output)
            else:
                output = task["function"](state)
            self.results[name] = output  # Store the result
            task["done"] = True
            # Notify other tasks that may be waiting on this one
            self.condition.notify_all()

    def run_all(self, state):
        threads = []
        for name in self.tasks:
            thread = threading.Thread(target=self.run_task, args=(name, state))
            threads.append(thread)
            thread.start()
        for thread in threads:
            thread.join()

def main():
    initial_S = 100
    state = SharedState(initial_S)

    executor = Executor()
    executor.add_task(function_A, "A", [])
    executor.add_task(function_B, "B", [])
    executor.add_task(function_C, "C", [])
    executor.add_task(function_D, "D", ["B"])  # D depends on B, and now also receives B's output

    executor.run_all(state)

if __name__ == "__main__":
    main()