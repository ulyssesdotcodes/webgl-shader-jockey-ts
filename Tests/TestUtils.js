var TestUtils;
(function (TestUtils) {
    function getMessageValue(observer, index) {
        return observer.messages[index].value.value;
    }
    TestUtils.getMessageValue = getMessageValue;
})(TestUtils || (TestUtils = {}));
