var Flight = function () {

    this.getInformation = function () {
        return "hallo";
    };
};

module.exports = function () {
    var instance = new Flight();


    return instance;
};