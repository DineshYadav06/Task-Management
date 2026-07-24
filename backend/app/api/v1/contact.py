from fastapi import APIRouter, BackgroundTasks
from app.schemas.common import ContactRequest, StandardResponse
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

router = APIRouter(prefix="/contact", tags=["Contact & Inquiries"])
logger = logging.getLogger(__name__)

def send_contact_email(name: str, user_email: str, subject: str, message: str):
    target_email = "dineshkumaryadav12651@gmail.com"
    
    # Normally these come from environment variables.
    # The user will need to configure EMAIL_SENDER and EMAIL_PASSWORD in their .env
    sender_email = os.environ.get("EMAIL_SENDER")
    sender_password = os.environ.get("EMAIL_PASSWORD")
    
    if not sender_email or not sender_password:
        logger.warning("EMAIL_SENDER or EMAIL_PASSWORD not found in environment. Email will NOT be sent.")
        return
        
    try:
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = target_email
        msg['Subject'] = f"TaskMaster Inquiry: {subject}"
        
        body = f"You have received a new contact inquiry from your website.\n\n" \
               f"Name: {name}\n" \
               f"Email: {user_email}\n" \
               f"Subject: {subject}\n\n" \
               f"Message:\n{message}"
               
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        logger.info(f"Successfully sent contact email from {user_email} to {target_email}")
    except Exception as e:
        logger.error(f"Failed to send contact email: {str(e)}")

@router.post("", response_model=StandardResponse)
async def submit_contact_form(req: ContactRequest, background_tasks: BackgroundTasks):
    """
    Handle contact form submissions from the public website.
    Sends an email to the configured admin address.
    """
    # Log it locally as well
    print("\n" + "="*50)
    print("NEW CONTACT INQUIRY RECEIVED")
    print(f"Name:    {req.name}")
    print(f"Email:   {req.email}")
    print(f"Subject: {req.subject}")
    print(f"Message: {req.message}")
    print("="*50 + "\n")
    
    # Send email in background so the user doesn't wait
    background_tasks.add_task(
        send_contact_email, 
        req.name, 
        req.email, 
        req.subject, 
        req.message
    )
    
    return {"status": "success", "message": "Thank you for reaching out! Our team will get back to you shortly."}
