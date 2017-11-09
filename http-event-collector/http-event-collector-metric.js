var https = require("https");
const querystring = require('querystring');    
//var request = require("request");


module.exports = function(RED) {
    function HTTPEventCollector(config) {
        RED.nodes.createNode(this,config);
        var context = this.context();
        var node = this;
        var myMessage = null;


        this.myToken = config.inputToken.toString();
        this.myHostname = config.inputHostname.toString();
        this.mySource = config.inputSource.toString();
        this.myPort = config.inputPort.toString();


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
                
            //console.log("postData:",postData);

            // concant Authorization for "Splunk" to Token
            var SplunkString = "Splunk ";
            var Token = this.myToken.toString();
            var AuthorizationString = SplunkString.concat(Token);

            var options = {
                hostname: this.myHostname,
                port: this.myPort,
                protocol: "https:",
                path: "/services/collector",
                method: 'POST',
                headers: {
                    Authorization: AuthorizationString
                    //'Content-Length': Buffer.byteLength(postData)
                }
            };
            //console.log("headers:", options.headers);

            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
              
            var req = https.request(options, (res) => {
                //console.log('statusCode:', res.statusCode);
                //console.log('headers:', res.headers);
              
                res.on('data', (d) => {
                    process.stdout.write(d);
                });
            });
              
            req.on('error', (e) => {
                console.error(e);
            });
            
            // write data to request body and make sure the _value is valid
            if (isNaN(_TemplateStructure.fields._value) === false && _TemplateStructure.fields._value != null 
                    && typeof(_TemplateStructure.fields._value) != "boolean"){
                req.write(postData);
                req.end();
            }
            else {
                console.log("msg.event._value is not a number");
            }

        });
    }
    RED.nodes.registerType("http-event-collector-metric",HTTPEventCollector);
};
