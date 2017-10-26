var bunyan = require("bunyan");
var splunkBunyan = require("splunk-bunyan-logger");


module.exports = function(RED) {
    function HTTPEventCollector(config) {
        RED.nodes.createNode(this,config);
        var context = this.context();
        var node = this;
        var myMessage = null;



        /**
         * Only the token property is required.
         */
        this.myURI = config.inputURI.toString();
        this.myToken = config.inputToken.toString();
        this.mySourcetype = config.inputSourcetype.toString();
        this.myHost = config.inputHost.toString();
        this.mySource = config.inputSource.toString();
        this.myIndex = config.inputIndex.toString();

        var config = {
            token: this.myToken,
            url: this.myURI
        };

        var splunkStream = splunkBunyan.createStream(config);

        // Note: splunkStream must be set to an element in the streams array
        var Logger = bunyan.createLogger({
            name: "my logger",
            streams: [
                splunkStream
            ]
        });

        Logger.error = function(err, context) {
            // Handle errors here
            console.log("error", err, "context", context);
        };


        this.on('input', function(msg) {

            // Attempt to convert msg.payload to a json structure.
            try{
                myMessage = JSON.parse(msg.payload)
            }
            catch(err){
                myMessage = msg.payload
            }

            var payload = {
                // Data sent from previous node msg.payload
                message : { payload: myMessage,
                    msgMetaData : msg
                },
                // Metadata
                metadata: {
                    source: this.mySource,
                    sourcetype: this.mySourcetype,
                    index: this.myIndex,
                    host: this.myHost
                },
                // Severity is also optional
                severity: "info"
            };

            delete payload.message.msgMetaData.payload;

            console.log("Sending payload", payload);
            Logger.info(payload, "Chicken coup looks stable.");


        });
    }
    RED.nodes.registerType("http-event-collector",HTTPEventCollector);
};
