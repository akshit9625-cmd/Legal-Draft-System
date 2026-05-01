class MockTensor:
    def argmax(self, dim=-1):
        class Result:
            def item(self): return 0
        return Result()
    def __getitem__(self, idx):
        return self

def softmax(logits, dim=-1):
    return [MockTensor()]
