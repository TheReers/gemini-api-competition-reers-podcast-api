const baseTemplate = (content: string, year:  string | number, title='Reers AI Podcast') => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #dddddd;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            background-color: #007bff;
            color: #ffffff;
        }
        .content {
            padding: 20px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f4f4f4;
            color: #555555;
            font-size: 12px;
        }
        .otp, .button {
            display: block;
            text-align: center;
            font-size: 20px;
            color: #007bff;
            margin: 20px 0;
            font-weight: bold;
        }
        .button a {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
        }
        .button a:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Reers AI Podcast</h1>
        </div>
        <div class="content">
            <!-- Specific email content will be injected here -->
            ${content}
            <p>Best regards,</p>
            <p>Reers Team</p>
        </div>
        <div class="footer">
            <p>&copy; ${year} Reers AI Podcast. All rights reserved.</p>
        </div>
    </div>
</body>
</html>

`

export default baseTemplate
