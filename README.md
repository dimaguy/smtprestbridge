# smtprestbridge
Simple SMTP-Rest Bridge designed to work with [cloudflare-email](https://github.com/dimaguy/cloudflare-email) API.  
It tries to cap emails at 20MB, but it's untested.  
Attachments are discarded for now (A workaround of automatically uploading them somewhere else and placing a link on the email body is in the roadmap)  
STARTTLS isn't supported yet, and shouldn't be for the foresseable future due to a bug that causes the code to hang, just use stunnel (recommended on port 465) and it'll suffice. 
Only HTTPS is supported for the REST API(fetch() is on the roadmap).  
Multiple recipients is untested.
BCC and CC is untested.
Reply-To is untested.
Sender and recipient names are untested.

## Environment variables used
(You can use an .env file)
- SMTPHOST - SMTP Host
- SMTPPORT - SMTP Port (Recommended: 25)
- EMAILDOMAIN - Sender email domain
- SMTPAUTHOPTIONAL - SMTP Auth Optional
- SMTPAUTHUSER - SMTP Auth User
- SMTPAUTHPASS - SMTP Auth Password
- RESTHOST - REST Host
- RESTPORT - REST Port
- RESTTOKEN - REST Token
