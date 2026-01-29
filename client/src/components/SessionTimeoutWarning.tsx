import { useEffect, useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock } from 'lucide-react';

interface SessionTimeoutWarningProps {
  warningThresholdMs?: number;
  sessionTimeoutMs?: number;
  onTimeout?: () => void;
  onExtendSession?: () => void;
}

export function SessionTimeoutWarning({
  warningThresholdMs = 2 * 60 * 1000,
  sessionTimeoutMs = 15 * 60 * 1000,
  onTimeout,
  onExtendSession,
}: SessionTimeoutWarningProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const resetActivity = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
  }, []);

  const handleExtendSession = useCallback(async () => {
    try {
      await fetch('/api/session/extend', {
        method: 'POST',
        credentials: 'include',
      });
      resetActivity();
      onExtendSession?.();
    } catch (error) {
      console.error('Failed to extend session', error);
      resetActivity();
    }
  }, [resetActivity, onExtendSession]);

  const handleTimeout = useCallback(() => {
    setShowWarning(false);
    onTimeout?.();
    window.location.href = '/admin/login?timeout=true';
  }, [onTimeout]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (!showWarning) {
        setLastActivity(Date.now());
      }
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [showWarning]);

  useEffect(() => {
    const checkTimeout = () => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      const remainingTime = sessionTimeoutMs - inactiveTime;

      if (remainingTime <= 0) {
        handleTimeout();
        return;
      }

      if (remainingTime <= warningThresholdMs && !showWarning) {
        setShowWarning(true);
        setRemainingSeconds(Math.ceil(remainingTime / 1000));
      }
    };

    const interval = setInterval(checkTimeout, 1000);
    return () => clearInterval(interval);
  }, [lastActivity, sessionTimeoutMs, warningThresholdMs, showWarning, handleTimeout]);

  useEffect(() => {
    if (!showWarning) return;

    const countdown = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [showWarning, handleTimeout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AlertDialog open={showWarning} onOpenChange={() => {}}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            Session Expiring Soon
          </AlertDialogTitle>
          <AlertDialogDescription>
            For your security, your session will expire in{' '}
            <span className="font-bold text-foreground">{formatTime(remainingSeconds)}</span>{' '}
            due to inactivity. This is required for HIPAA compliance to protect sensitive health information.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={handleTimeout}
            data-testid="button-logout-now"
          >
            Logout Now
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleExtendSession}
            data-testid="button-continue-session"
          >
            Continue Session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
