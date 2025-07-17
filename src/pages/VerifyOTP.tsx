
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import BackButton from "@/components/BackButton";
import { Clock, Mail, RotateCcw } from "lucide-react";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { userId, email, type = 'registration' } = location.state || {};

  useEffect(() => {
    if (!userId || !email) {
      navigate('/register');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [userId, email, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const endpoint = type === 'registration' 
        ? '/api/auth/verify-registration-otp' 
        : '/api/auth/verify-password-reset-otp';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
        });

        if (type === 'registration') {
          // Store token and user data for registration
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Route based on user role
          if (data.user.role === 'admin' || data.user.role === 'super_admin' || data.user.role === 'diagnostic_center_admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        } else {
          // For password reset, go to reset password page
          navigate('/reset-password', { 
            state: { userId, email } 
          });
        }
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, type }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "OTP Resent",
          description: "A new OTP has been sent to your email",
        });
        setTimeLeft(600); // Reset timer
        setOtp(""); // Clear current OTP
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to resend OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  const getTitle = () => {
    return type === 'registration' ? 'Verify Your Email' : 'Verify OTP for Password Reset';
  };

  const getDescription = () => {
    return type === 'registration' 
      ? 'Enter the verification code sent to your email to complete registration'
      : 'Enter the verification code sent to your email to reset your password';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <BackButton to={type === 'registration' ? "/register" : "/login"} />
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>{getTitle()}</CardTitle>
            <CardDescription>
              {getDescription()}
              <br />
              <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP 
                  value={otp} 
                  onChange={setOtp} 
                  maxLength={6}
                  disabled={loading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {timeLeft > 0 ? `OTP expires in ${formatTime(timeLeft)}` : 'OTP expired'}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              onClick={handleVerifyOTP} 
              className="w-full" 
              disabled={loading || otp.length !== 6 || timeLeft === 0}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Didn't receive the code?</span>
              <Button
                variant="link"
                onClick={handleResendOTP}
                disabled={resendLoading || timeLeft > 540} // Allow resend after 1 minute
                className="p-0 h-auto text-sm"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                {resendLoading ? "Resending..." : "Resend"}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              <Link to="/login" className="text-primary hover:underline">
                Back to Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOTP;
