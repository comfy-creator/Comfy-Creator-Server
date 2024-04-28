from typing import Protocol

class AbstractThing(Protocol):
    @property
    def CATEGORY(self) -> str:
        """
        A property that should return the category of the node.
        """
        pass
    
    @property
    def NAME(self) -> str:
        """
        A property that should return the name of the node.
        """
        pass

class FuckMe(AbstractThing):
    NAME = "dsdafsd"
    

fuckme = FuckMe()
print(fuckme.NAME)


fuckme.destroyitall()