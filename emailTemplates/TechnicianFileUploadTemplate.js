const generateTechnicianAssignmentEmail = (ticket, technicianName,securityCode) => {
  console.log(ticket,"ticket")
  console.log(technicianName,"technician namer")
  // const ticketLink = `${process.env.FRONTEND_URL}/technician/tickets/${ticket._id}`;
  const ticketLink = `${process.env.CLIENT_BASE_URL}/fileupload-by-technician/${technicianName._id}/${ticket._id}`;
  // /get-one-active-assigned-ticket/:technicianId/:ticketId",

    const securityCodeSection = securityCode ? `
    <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;">
      <h3 style="margin-top: 0; color: #ff6f00;">Security Code</h3>
      <p><strong>Your verification code:</strong> 
        <span style="font-size: 18px; font-weight: bold; letter-spacing: 2px;">${securityCode}</span>
      </p>
      <p>This code will expire in 7 days.</p>
    </div>
  ` : '';
  
  return {
    subject: `New Ticket Assigned: ${ 'Ticket #' + ticket._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Quik Serv Ticket Assignment</h2>
        <p>Hello ${technicianName.name}</p>
        <p>You have been assigned a new ticket:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="margin-top: 0;">Ticket Details</h3>
          <p><strong>Ticket ID:</strong> ${ticket._id}</p>
          <p><strong>Subject:</strong> ${ticket.subjectLine || 'N/A'}</p>
          <p><strong>Location:</strong> ${ticket.location}</p>
          
        
        </div>

          <!-- ... existing header and ticket details ... -->
      ${securityCodeSection}
        
        <p>Please click the button below to view the ticket and upload required images/videos:</p>
        <a href="${ticketLink}" 
           style="display: inline-block; background-color: #3498db; color: white; 
                  padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 15px 0;">
          View Ticket & Upload Files
        </a>
        
        <p>You can also add new vehicle numbers or update existing ones through this link.</p>
        
        <p style="margin-top: 30px;">Best regards,<br>The Quik Serv Team</p>
      </div>
    `,
    text: `
      Quik Serv Ticket Assignment
      Hello ${technicianName.name},
      
      You have been assigned a new ticket:
      
      Ticket ID: ${ticket._id}
      Subject: ${ticket.subjectLine || 'N/A'}
      Location: ${ticket.location}
    
      
      Please visit this link to view the ticket and upload required images/videos:
      ${ticketLink}
      
      You can also add new vehicle numbers or update image/video existing ones through this link.
      
      Best regards,
      The Quik Serv Team
    `
  };
};

module.exports = generateTechnicianAssignmentEmail;