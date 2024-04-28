class Executor:
    def __init__(self):
        pass
    
    def execute(self, graph):
        pass
        

# Example custom node
def denoiser(input):
    return input


from rx import create
from rx.scheduler import ThreadPoolScheduler
import threading
import time

def get_stock_price(observer, scheduler):
    for i in range(10):  # Simulate real-time updates
        time.sleep(1)  # Simulate time delay
        observer.on_next(f"Stock price update {i}")
    observer.on_completed()

scheduler = ThreadPoolScheduler(threading.active_count())
observable = create(get_stock_price)
observable.subscribe(
    on_next=lambda x: print(x),
    on_completed=lambda: print("Final price reached."),
    scheduler=scheduler
)