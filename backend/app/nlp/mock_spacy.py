class MockToken:
    def __init__(self, text):
        self.text = text
        self.lemma_ = text.lower()
        self.is_stop = False
        self.is_punct = False
        self.is_alpha = True
    def __len__(self):
        return len(self.text)

class Language:
    pass

class MockDoc:
    def __init__(self, text):
        self.text = text
        self.ents = []
        self.sents = [self] # Doc acts as a single sentence
    def __iter__(self):
        # Extremely simple whitespace tokenization for mock
        for t in self.text.split():
            yield MockToken(t)

class MockNLP:
    def __call__(self, text):
        return MockDoc(text)
    def pipe(self, texts):
        return [MockDoc(t) for t in texts]

def load(*args, **kwargs):
    return MockNLP()
