module TestUtils {
  export function getMessageValue<T>(observer: Rx.MockObserver<T>, index: number): T {
    return observer.messages[index].value.value;
  }
} 