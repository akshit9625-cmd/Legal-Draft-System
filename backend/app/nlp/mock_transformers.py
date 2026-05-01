class AutoTokenizer:
    @classmethod
    def from_pretrained(cls, *args, **kwargs):
        return cls()
    def __call__(self, *args, **kwargs):
        return {}

class AutoModelForSequenceClassification:
    @classmethod
    def from_pretrained(cls, *args, **kwargs):
        return cls()
    def eval(self): pass
    def to(self, *args, **kwargs): return self
    def cuda(self): return self
