namespace SensorAnalytics.Api.Services
{
    public class CircularBuffer<T>
    {
        private readonly T[] _buffer;
        private int _nextIndex;
        private int _count;
        private readonly ReaderWriterLockSlim _lock = new();

        public CircularBuffer(int capacity)
        {
            if (capacity <= 0) throw new ArgumentOutOfRangeException(nameof(capacity));
            _buffer = new T[capacity];
            _nextIndex = 0;
            _count = 0;
        }

        public void Add(T item)
        {
            _lock.EnterWriteLock();
            try
            {
                _buffer[_nextIndex] = item;
                _nextIndex = (_nextIndex + 1) % _buffer.Length;
                if (_count < _buffer.Length) _count++;
            }
            finally { _lock.ExitWriteLock(); }
        }

        public T[] Snapshot()
        {
            _lock.EnterReadLock();
            try
            {
                var result = new T[_count];
                int start = (_nextIndex - _count + _buffer.Length) % _buffer.Length;
                if (start + _count <= _buffer.Length)
                {
                    Array.Copy(_buffer, start, result, 0, _count);
                }
                else
                {
                    int firstLen = _buffer.Length - start;
                    Array.Copy(_buffer, start, result, 0, firstLen);
                    Array.Copy(_buffer, 0, result, firstLen, _count - firstLen);
                }
                return result;
            }
            finally { _lock.ExitReadLock(); }
        }

        public int Count => _count;
        public int Capacity => _buffer.Length;
    }

}
