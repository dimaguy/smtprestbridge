const SMTPServer = require("smtp-server").SMTPServer;
const simpleParser = require('mailparser').simpleParser;
const https = require("https");
require('dotenv').config();
const RESToptions = {
    hostname: process.env.RESTHOST,
    port: process.env.RESTPORT,
    path: "/api/email",
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.RESTTOKEN
    }
}
const SMTPoptions = {
    size: 1024 * 1024 * 20, //size limit of 20MB
    secure: false,
    authOptional: process.env.SMTPAUTHOPTIONAL,
    allowInsecureAuth: true,
    onAuth(auth, session, callback) {
        if (auth.username !== process.env.SMTPAUTHUSER || auth.password !== process.env.SMTPAUTHPASS) {
          return callback(new Error("Invalid username or password"));
        }
        callback(null, { user: 1 }); // where 1 is the user id or similar property
      },
    onMailFrom(address, session, callback) {
        if (address.address.endsWith(process.env.EMAILDOMAIN)) {
            return callback();
        } else {
            return callback(new Error("Invalid sender address"));
        }
    },
    onData(stream, session, callback) {
        let err;
        stream.on("end", () => {
            if (stream.sizeExceeded) {
              err = new Error("Message exceeds fixed maximum message size");
              err.responseCode = 552;
              return callback(err);
        }});
        simpleParser(stream, {}, (err, parsed) => {
            let mail = {
                from: parsed.from.value[0],
                to: (parsed.to != undefined) ? parsed.to.value : undefined,
                subject: (parsed.subject != undefined) ? parsed.subject : "(No Subject)",
                text: parsed.text,
                html: parsed.html,
                bcc: (parsed.bcc != undefined) ? parsed.bcc.value : undefined,
                cc: (parsed.cc != undefined) ? parsed.cc.value : undefined,
                replyTo: (parsed.replyTo != undefined) ? parsed.replyTo.value : undefined
            }
            console.log(JSON.stringify(mail));
            RESToptions.headers["Content-Length"] = Buffer.byteLength(JSON.stringify(mail));
            console.log(RESToptions);
            const req = https.request(RESToptions, (res) => {
                console.log(res.statusCode);
                req.on("data", d => {process.stdout.write(d)});
                if (res.statusCode !== 200) {
                    return callback(new Error("Bad response from REST API: " + res.statusCode));
                }
        })
            req.on("error", err => {console.log("Error: " + err.message)});
            req.write(JSON.stringify(mail));
            req.end();
            callback(null, "Message queued as ordered"); // accept the message once the stream is ended
        });
      },
}
const server = new SMTPServer(SMTPoptions);
server.on("error", (err) => {
    console.log("Error %s", err.message);
  });
server.listen(process.env.SMTPPORT, process.env.SMTPHOST);
console.log("SMTP Server listening on " + process.env.SMTPHOST + ":" + process.env.SMTPPORT);
