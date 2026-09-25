import * as React from "react";

interface EmailTemplateProps {
    email: string;
    hashedToken: string;
}

export const VerifyEmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
    email,
    hashedToken,
}) => (
    <div
        style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            maxWidth: "600px",
            margin: "0 auto",
            padding: "20px",
            backgroundColor: "#f4f4f4",
            borderRadius: "8px",
        }}
    >
        {/* Email clients do not render SVG, so the logo is the 1000px PNG shown
            at 155 x 40 (its 1000 x 258 ratio). It needs an absolute URL. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
            src={`${process.env.NEXT_PUBLIC_BASE_URL}/brand/png/fitdose-wordmark@1000w.png`}
            alt="FitDose"
            width={155}
            height={40}
            style={{
                display: "block",
                width: "155px",
                height: "40px",
                border: 0,
                marginBottom: "24px",
            }}
        />

        <h2
            style={{
                marginBottom: "20px",
                color: "#333",
                fontSize: "24px",
                lineHeight: "1.4",
            }}
        >
            Verify your email address
        </h2>

        <p
            style={{
                marginBottom: "20px",
                color: "#555",
                fontSize: "16px",
                lineHeight: "1.6",
            }}
        >
            Thank you for signing up for FitDose. To complete your registration,
            please verify your email address. This helps us ensure that you are
            the owner of the email address you provided.
        </p>

        <p
            style={{
                marginBottom: "30px",
                color: "#555",
                fontSize: "16px",
                lineHeight: "1.6",
            }}
        >
            Please click the button below to verify your email address:
        </p>

        <a
            href={`${process.env.DOMAIN}/verifyemail?token=${hashedToken}`}
            style={{
                display: "inline-block",
                padding: "12px 24px",
                backgroundColor: "#3f51b5",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "5px",
                fontSize: "16px",
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: "20px",
            }}
        >
            Verify Email
        </a>

        <p
            style={{
                marginBottom: "20px",
                color: "#555",
                fontSize: "16px",
                lineHeight: "1.6",
            }}
        >
            Alternatively, you can copy and paste the link below into your
            browser to verify your email address:
        </p>

        <p
            style={{
                marginBottom: "20px",
                color: "#555",
                fontSize: "16px",
                lineHeight: "1.6",
                wordBreak: "break-all",
            }}
        >
            {`${process.env.DOMAIN}/verifyemail?token=${hashedToken}`}
        </p>
    </div>
);
