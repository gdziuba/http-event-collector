var SplunkLogger = require("splunk-logging").Logger;


module.exports = function(RED) {
    function HTTPEventCollector(config) {
        RED.nodes.createNode(this,config);

        var context = this.context();
        var node = this
        var server = RED.nodes.getNode(config.server);
        var message = null;



        /**
         * Only the token property is required.
         */
        this.SourceType = server.SourceType;
        this.Host = (config.Host.toString() != "") ? config.Host.toString() : server.Host;
        this.Source = (config.Source.toString() != "") ? config.Source.toString() : server.Source;
        this.Index = (config.Index.toString() != "") ? config.Index.toString() : server.Index;

        var splunkConfig = {
            token: server.Token,
            url: server.URI
        };

        this.on('input', function(msg) {

            // Create a new logger
            var Logger = new SplunkLogger(splunkConfig);
            
            Logger.error = function(err, context) {
                // Handle errors here
                console.log("error", err, "context", context);
            };

            // set the log level if it is part of the message
            var level = msg.LogLevel;
            if(level == undefined) {
                level = server.LogLevel;
            } else {
                // remove from logged message
                delete msg.LogLevel;
            }

            // Attempt to convert msg.payload to a json structure.
            try{
                message = JSON.parse(msg)
            }
            catch(err){
                message = msg
            }

            var payload = {
                // Data sent from previous node msg.payload
                message: message,                
                //msgMetaData : msg,
                // Metadata
                    metadata: {
                        source: this.Source,
                        sourcetype: this.SourceType,
                        index: this.Index,
                        host: this.Host,
                    },
                    // Severity is also optional
                severity: level
            
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
