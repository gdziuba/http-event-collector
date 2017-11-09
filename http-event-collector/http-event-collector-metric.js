var https = require("https");
const querystring = require('querystring');    
//var request = require("request");


module.exports = function(RED) {
    function HTTPEventCollector(config) {
        RED.nodes.createNode(this,config);
        var context = this.context();
        var node = this;
        var myMessage = null;



        /**
         * Only the token property is required.
         */
        this.myToken = config.inputToken.toString();
        this.myHostname = config.inputHostname.toString();
        this.mySource = config.inputSource.toString();
        this.myPort = config.inputPort.toString();

        //var splunkStream = splunkBunyan.createStream(config);

        // Create a new logger



        this.on('input', function(msg) {

            var dims = null;

            try{
                myMessage = JSON.parse(msg.payload)
            }
            catch(err){
                myMessage = msg.payload;
                console.log("payload isn't json or has already converted");
            }
        
            if (myMessage.Splunkdims != null){
                dims = myMessage.fields.Splunkdims
            }

            // while (myMessage.fields.hasChildNodes()){
            //     myMessage.fields.removeChild(myMessage.fields.lastChild);
            // }

            // Build New Structure
            var _TemplateStructure = {
                time: Date.now(),
                event: "metric",
                source: this.mySource,
                host: this.myHostname,
                fields:{
                    metric_name: myMessage.fields.metric_name,
                    _value: myMessage.fields._value,
                }
            }
            if (myMessage.fields.Splunkdims != null){
                _TemplateStructure.fields = Object.assign(myMessage.fields);
            }

            if (myMessage.host != null){
                _TemplateStructure.host = myMessage.host;
            }
            if (myMessage.time != null){
                _TemplateStructure.time = myMessage.time;
            }

            var postData = JSON.stringify(_TemplateStructure);
                
            console.log("postData:",postData);

            var options = {
                hostname: this.myHostname,
                port: this.myPort,
                protocol: "https:",
                path: "/services/collector",
                method: 'POST',
                headers: {
                    Authorization: 'Splunk 5e5f1c02-4471-4218-b7ab-1785921f7993'
                    //'Content-Length': Buffer.byteLength(postData)
                }
            };
            console.log("headers:", options.headers);

            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
              
            var req = https.request(options, (res) => {
                console.log('statusCode:', res.statusCode);
                console.log('headers:', res.headers);
              
                res.on('data', (d) => {
                    process.stdout.write(d);
                });
            });
            //console.log("req", req);
              
            req.on('error', (e) => {
                console.error(e);
            });
            // write data to request body
            req.write(postData);
            req.end();
                      


        });
    }
    RED.nodes.registerType("http-event-collector-metric",HTTPEventCollector);
};
