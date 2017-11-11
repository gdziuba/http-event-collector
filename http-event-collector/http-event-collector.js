
var SplunkLogger = require("splunk-logging").Logger;


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



        this.on('input', function(msg) {

            // Create a new logger
            var Logger = new SplunkLogger(config);
            
            Logger.error = function(err, context) {
                // Handle errors here
                console.log("error", err, "context", context);
            };


            // Attempt to convert msg.payload to a json structure.
            try{
                myMessage = JSON.parse(msg)
            }
            catch(err){
                myMessage = msg
            }

            var payload = {
                // Data sent from previous node msg.payload
                message: myMessage,                
                //msgMetaData : msg,
                // Metadata
                    metadata: {
                        source: this.mySource,
                        sourcetype: this.mySourcetype,
                        index: this.myIndex,
                        host: this.myHost,
                    },
                    // Severity is also optional
                severity: "info"
            
            };

            

            console.log("Sending payload", payload);
            Logger.send(payload, function(err, resp, body) {
                // If successful, body will be { text: 'Success', code: 0 }
                console.log("Response from Splunk", body);
            });


        });
    }
    RED.nodes.registerType("splunk-http-event-collector",HTTPEventCollector);
};
