import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, ScanBarcode, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useCheckInTicket } from '@/http/generated';

export const Route = createFileRoute('/_app/$eventId/tickets/check-in/')({
  component: CheckInPage,
});

interface CheckInError {
  message: string;
  ticketNumber: string;
  previousCheckInAt?: string;
  memberName?: string;
}

interface CheckInWarning {
  ticketNumber: string;
  memberName?: string;
  returned: boolean;
  negativeBalance: boolean;
}

interface CheckInHistory {
  ticketNumber: string;
  success: boolean;
  timestamp: Date;
  memberName?: string;
  sessionName?: string;
  error?: string;
}

function CheckInPage() {
  const { eventId } = Route.useParams();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [barcodeInput, setBarcodeInput] = useState('');
  const [errorDialog, setErrorDialog] = useState<CheckInError | null>(null);
  const [warningDialog, setWarningDialog] = useState<CheckInWarning | null>(null);
  const [history, setHistory] = useState<CheckInHistory[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showReturnedWarning, setShowReturnedWarning] = useState(() => {
    const saved = localStorage.getItem('check-in-show-returned-warning');
    return saved !== 'false';
  });
  const [showNegativeBalanceWarning, setShowNegativeBalanceWarning] = useState(() => {
    const saved = localStorage.getItem('check-in-show-negative-balance-warning');
    return saved !== 'false';
  });
  const [lastSuccess, setLastSuccess] = useState<{ ticketNumber: string; memberName?: string; sessionName?: string } | null>(null);

  // Hook de mutação para check-in
  const checkInMutation = useCheckInTicket();

  const playErrorSound = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Som de erro: dois beeps descendentes
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.15);
      
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      // Segundo beep
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        
        osc2.frequency.setValueAtTime(400, audioContext.currentTime);
        osc2.frequency.setValueAtTime(200, audioContext.currentTime + 0.15);
        
        gain2.gain.setValueAtTime(0.4, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.3);
      }, 150);
    } catch (e) {
      console.warn('Não foi possível tocar o som de erro:', e);
    }
  }, [soundEnabled]);

  const playSuccessSound = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Som de sucesso: beep ascendente
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (e) {
      console.warn('Não foi possível tocar o som de sucesso:', e);
    }
  }, [soundEnabled]);

  const playWarningSound = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // Som de warning: três beeps médios
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
        }, i * 200);
      }
    } catch (e) {
      console.warn('Não foi possível tocar o som de warning:', e);
    }
  }, [soundEnabled]);

  const processCheckIn = useCallback((ticketNumberStr: string) => {
    const trimmed = ticketNumberStr.trim();
    if (!trimmed || checkInMutation.isPending || warningDialog) return;
    
    const ticketNumber = Number.parseInt(trimmed, 10);
    if (Number.isNaN(ticketNumber)) {
      playErrorSound();
      setErrorDialog({
        message: 'Número de ingresso inválido',
        ticketNumber: trimmed,
      });
      setBarcodeInput('');
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }
    
    setLastSuccess(null);
    
    checkInMutation.mutate(
      { eventId, data: { ticketNumber } },
      {
        onSuccess: (data) => {
          // Verifica se já tinha check-in anterior
          if (data.alreadyCheckedIn && data.deliveredAt) {
            playErrorSound();
            setErrorDialog({
              message: 'Este ingresso já foi utilizado!',
              ticketNumber: String(data.number),
              previousCheckInAt: String(data.deliveredAt),
              memberName: data.member?.name,
            });
            setHistory(prev => [{
              ticketNumber: String(data.number),
              success: false,
              timestamp: new Date(),
              error: 'Ingresso já utilizado',
              memberName: data.member?.name,
              sessionName: data.member?.session?.name,
            }, ...prev].slice(0, 50));
            setBarcodeInput('');
            setTimeout(() => inputRef.current?.focus(), 100);
          } else if (
            (data.returned && showReturnedWarning) || 
            (data.negativeBalance && showNegativeBalanceWarning)
          ) {
            // Mostra alerta de warning se returned ou negativeBalance for true e o alerta estiver habilitado
            playWarningSound();
            setWarningDialog({
              ticketNumber: String(data.number),
              memberName: data.member?.name,
              returned: data.returned,
              negativeBalance: data.negativeBalance,
            });
            // Não limpa o input nem foca - bloqueia até confirmação
          } else {
            // Sucesso no check-in!
            playSuccessSound();
            setLastSuccess({ 
              ticketNumber: String(data.number), 
              memberName: data.member?.name,
              sessionName: data.member?.session?.name,
            });
            
            toast.success('Check-in realizado com sucesso!', {
              description: data.member?.name 
                ? `Ingresso ${data.number} - ${data.member.name}` 
                : `Ingresso ${data.number}`,
            });
            
            setHistory(prev => [{
              ticketNumber: String(data.number),
              success: true,
              timestamp: new Date(),
              memberName: data.member?.name,
              sessionName: data.member?.session?.name,
            }, ...prev].slice(0, 50));
            
            setBarcodeInput('');
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        },
        onError: (error) => {
          playErrorSound();
          
          const errorData = error.response?.data as { error?: string; deliveredAt?: string; memberName?: string } | undefined;
          
          const checkInError: CheckInError = {
            message: errorData?.error || 'Erro ao processar check-in',
            ticketNumber: trimmed,
            previousCheckInAt: errorData?.deliveredAt,
            memberName: errorData?.memberName,
          };
          
          setErrorDialog(checkInError);
          
          setHistory(prev => [{
            ticketNumber: trimmed,
            success: false,
            timestamp: new Date(),
            error: checkInError.message,
            memberName: errorData?.memberName,
          }, ...prev].slice(0, 50));
          
          setBarcodeInput('');
          setTimeout(() => inputRef.current?.focus(), 100);
        },
      }
    );
  }, [eventId, checkInMutation, playErrorSound, playSuccessSound, playWarningSound, showReturnedWarning, showNegativeBalanceWarning, warningDialog]);

  // Handler para o input do scanner
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !warningDialog) {
      e.preventDefault();
      processCheckIn(barcodeInput);
    }
  };

  // Handler para confirmar warning e continuar com o check-in
  const handleConfirmWarning = useCallback(() => {
    if (!warningDialog) return;
    
    // Processa o check-in como sucesso após confirmação
    playSuccessSound();
    setLastSuccess({ 
      ticketNumber: warningDialog.ticketNumber, 
      memberName: warningDialog.memberName,
    });
    
    toast.success('Check-in realizado com sucesso!', {
      description: warningDialog.memberName 
        ? `Ingresso ${warningDialog.ticketNumber} - ${warningDialog.memberName}` 
        : `Ingresso ${warningDialog.ticketNumber}`,
    });
    
    setHistory(prev => [{
      ticketNumber: warningDialog.ticketNumber,
      success: true,
      timestamp: new Date(),
      memberName: warningDialog.memberName,
    }, ...prev].slice(0, 50));
    
    setWarningDialog(null);
    setBarcodeInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [warningDialog, playSuccessSound]);

  // Foca automaticamente no input ao montar o componente
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Re-foca no input quando o dialog de erro é fechado
  useEffect(() => {
    if (!errorDialog && !warningDialog) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [errorDialog, warningDialog]);

  // Salva preferências de mostrar alertas
  useEffect(() => {
    localStorage.setItem('check-in-show-returned-warning', String(showReturnedWarning));
  }, [showReturnedWarning]);

  useEffect(() => {
    localStorage.setItem('check-in-show-negative-balance-warning', String(showNegativeBalanceWarning));
  }, [showNegativeBalanceWarning]);

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'medium',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="px-8 pt-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-bold text-3xl tracking-tight">
            Check-in de Ingressos
          </h2>
          <p className="text-muted-foreground">
            Escaneie o código de barras do ingresso para dar baixa
          </p>
        </div>

        {/* Scanner Card */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <ScanBarcode className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Scanner</CardTitle>
                  <CardDescription>
                    O campo abaixo está pronto para receber a leitura
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Aguardando leitura do código de barras..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                disabled={checkInMutation.isPending || !!warningDialog}
                className={cn(
                  "h-16 text-center font-mono text-2xl",
                  checkInMutation.isPending && "animate-pulse",
                  warningDialog && "opacity-50 cursor-not-allowed"
                )}
                autoFocus
                autoComplete="off"
              />
              {checkInMutation.isPending && (
                <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/80">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
            </div>

            {/* Último sucesso */}
            {lastSuccess && (
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-semibold text-green-600 dark:text-green-400 text-lg">
                    Check-in realizado!
                  </p>
                  <p className="text-green-600/80 dark:text-green-400/80">
                    Ingresso {lastSuccess.ticketNumber}
                    {lastSuccess.memberName && ` - ${lastSuccess.memberName}`}
                  </p>
                </div>
              </div>
            )}

            {/* Configurações de alertas */}
            <div className="mt-4 space-y-2 rounded-lg border p-3">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Configurações de alertas
              </p>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-returned-warning"
                  checked={showReturnedWarning}
                  onCheckedChange={(checked) => setShowReturnedWarning(!!checked)}
                />
                <Label
                  htmlFor="show-returned-warning"
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Mostrar alertas de ingresso devolvido
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-negative-balance-warning"
                  checked={showNegativeBalanceWarning}
                  onCheckedChange={(checked) => setShowNegativeBalanceWarning(!!checked)}
                />
                <Label
                  htmlFor="show-negative-balance-warning"
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Mostrar alertas de saldo negativo
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Histórico */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de leituras</CardTitle>
            <CardDescription>
              Últimas {history.length} leituras realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Nenhuma leitura realizada ainda
              </div>
            ) : (
              <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
                {history.map((item) => (
                  <div
                    key={`${item.ticketNumber}-${item.timestamp.getTime()}`}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3",
                      item.success 
                        ? "border-green-500/20 bg-green-500/5" 
                        : "border-destructive/20 bg-destructive/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      )}
                      <div>
                        <p className={cn(
                          "font-mono font-medium",
                          item.success ? "text-green-600 dark:text-green-400" : "text-destructive"
                        )}>
                          {item.ticketNumber}
                          {item.memberName && (
                            <span className="ml-2 font-sans text-muted-foreground">
                              {item.memberName}
                            </span>
                          )}
                        </p>
                        {item.error && (
                          <p className="text-destructive/80 text-sm">{item.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={item.success ? "default" : "destructive"}
                      >
                        {item.success ? 'OK' : 'ERRO'}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {item.timestamp.toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Warning */}
      <Dialog open={!!warningDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20">
              <AlertTriangle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-center text-2xl text-blue-600 dark:text-blue-400">
              Atenção!
            </DialogTitle>
            <DialogDescription className="text-center">
              Este ingresso possui informações importantes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-lg border bg-muted p-4">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Número do ingresso</p>
                <p className="font-mono font-bold text-2xl">
                  {warningDialog?.ticketNumber}
                </p>
              </div>
            </div>
            
            {warningDialog?.memberName && (
              <div className="rounded-lg border bg-muted p-4">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Membro</p>
                  <p className="font-semibold text-lg">
                    {warningDialog.memberName}
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
              {warningDialog?.returned && (
                <div className="text-center">
                  <p className="font-semibold text-blue-600 dark:text-blue-400">
                    ⚠️ Ingresso Devolvido
                  </p>
                </div>
              )}
              {warningDialog?.negativeBalance && (
                <div className="text-center">
                  <p className="font-semibold text-blue-600 dark:text-blue-400">
                    ⚠️ Saldo Negativo
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={handleConfirmWarning}
              className="w-full"
              variant="default"
            >
              Confirmar e continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Erro */}
      <Dialog open={!!errorDialog} onOpenChange={() => setErrorDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <DialogTitle className="text-center text-2xl text-destructive">
              Erro no Check-in!
            </DialogTitle>
            <DialogDescription className="text-center">
              {errorDialog?.message}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-lg border bg-muted p-4">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Número do ingresso</p>
                <p className="font-mono font-bold text-2xl">
                  {errorDialog?.ticketNumber}
                </p>
              </div>
            </div>
            
            {errorDialog?.memberName && (
              <div className="rounded-lg border bg-muted p-4">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Membro</p>
                  <p className="font-semibold text-lg">
                    {errorDialog.memberName}
                  </p>
                </div>
              </div>
            )}
            
            {errorDialog?.previousCheckInAt && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="text-center">
                  <p className="text-amber-600 dark:text-amber-400 text-sm">Check-in anterior em</p>
                  <p className="font-bold text-amber-600 dark:text-amber-400 text-xl">
                    {formatDateTime(errorDialog.previousCheckInAt)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              onClick={() => setErrorDialog(null)}
              className="w-full"
              variant="secondary"
            >
              Fechar e continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
