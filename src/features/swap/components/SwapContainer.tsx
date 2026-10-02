"use client";

import { useState, useCallback, useEffect } from "react";
import { useMerchant } from "@/features/merchant/context/MerchantContext";
import { useGetBalance } from "@/features/wallet/hooks/useGetBalance";
import { useSwap } from "@/features/swap/hooks/useSwap";
import { SwapView } from "@/features/swap/components/SwapView";
import { useTokenRegistry } from "@/context/TokenRegistryContext";

const INPUT_MINT = "So11111111111111111111111111111111111111112"; // SOL

export function SwapContainer() {
  const { profile } = useMerchant();
  const merchantWallet = profile?.merchantWallet || "";
  
  const { data: balanceData, isLoading: isBalanceLoading } = useGetBalance(merchantWallet);
  const { quote, execute, quoteData, isQuoting, isExecuting, isError, errorMessage, reset } = useSwap();

  const { tokens } = useTokenRegistry();
  const catalogTokens = tokens.map(t => ({ mint: t.mint, symbol: t.symbol }));

  const [amount, setAmount] = useState<string>("");
  const [outputMint, setOutputMint] = useState<string>(catalogTokens.length > 0 ? catalogTokens[0].mint : "");

  useEffect(() => {
    if (!outputMint && catalogTokens.length > 0) {
      setOutputMint(catalogTokens[0].mint);
    }
  }, [catalogTokens, outputMint]);

  const [showQuoteChangeWarning, setShowQuoteChangeWarning] = useState(false);
  const [pendingQuote, setPendingQuote] = useState<any>(null);

  const outputTokenSymbol = catalogTokens.find(t => t.mint === outputMint)?.symbol || "Unknown";

  const [swapDirection, setSwapDirection] = useState<'sol-to-token' | 'token-to-sol'>('sol-to-token');

  const handleStartQuote = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0 || !outputMint) return;
    
    let decimals = 9; // SOL default
    if (swapDirection === 'token-to-sol') {
      const tokenInfo = balanceData?.tokens?.find(t => t.mint === outputMint);
      if (tokenInfo?.decimals) {
        decimals = tokenInfo.decimals;
      }
    }
    const lamports = Math.floor(parseFloat(amount) * Math.pow(10, decimals)).toString();
    
    await quote({
      inputMint: swapDirection === 'sol-to-token' ? INPUT_MINT : outputMint,
      outputMint: swapDirection === 'sol-to-token' ? outputMint : INPUT_MINT,
      amount: lamports,
      slippageBps: 20 // 0.5% default slippage
    });
  }, [amount, quote, outputMint]);

  const handleSwapExecute = useCallback(async () => {
    if (!quoteData || !amount || !outputMint) return;

    let decimals = 9;
    if (swapDirection === 'token-to-sol') {
      const tokenInfo = balanceData?.tokens?.find(t => t.mint === outputMint);
      if (tokenInfo?.decimals) {
        decimals = tokenInfo.decimals;
      }
    }
    const lamports = Math.floor(parseFloat(amount) * Math.pow(10, decimals)).toString();
    
    const newQuote = await quote({
      inputMint: swapDirection === 'sol-to-token' ? INPUT_MINT : outputMint,
      outputMint: swapDirection === 'sol-to-token' ? outputMint : INPUT_MINT,
      amount: lamports,
      slippageBps: 50
    });

    if (!newQuote) return; // quote failed

    // If outAmount changed, warn user
    if (newQuote.outAmount !== quoteData.outAmount) {
      setPendingQuote(newQuote);
      setShowQuoteChangeWarning(true);
    } else {
      // Execute immediately if no change
      await execute(newQuote);
      setAmount("");
      reset();
    }
  }, [quoteData, amount, quote, outputMint, execute, reset, swapDirection, balanceData]);

  const handleConfirmQuoteChange = useCallback(async () => {
    if (!pendingQuote) return;
    
    setShowQuoteChangeWarning(false);
    await execute(pendingQuote);
    
    setPendingQuote(null);
    setAmount("");
    reset();
  }, [pendingQuote, execute, reset]);

  const handleCancelQuoteChange = useCallback(() => {
    setShowQuoteChangeWarning(false);
    setPendingQuote(null);
  }, []);

  // Reset quote if output mint or direction changes
  useEffect(() => {
    reset();
  }, [outputMint, swapDirection, reset]);

  const handleToggleDirection = useCallback(() => {
    setSwapDirection(prev => prev === 'sol-to-token' ? 'token-to-sol' : 'sol-to-token');
    setAmount("");
    reset();
  }, [reset]);

  return (
    <SwapView
      balanceData={balanceData}
      isBalanceLoading={isBalanceLoading}
      amount={amount}
      onAmountChange={setAmount}
      quoteData={quoteData}
      isQuoting={isQuoting}
      isExecuting={isExecuting}
      onStartQuote={handleStartQuote}
      onSwapExecute={handleSwapExecute}
      error={errorMessage}
      showQuoteChangeWarning={showQuoteChangeWarning}
      onConfirmQuoteChange={handleConfirmQuoteChange}
      onCancelQuoteChange={handleCancelQuoteChange}
      catalogTokens={catalogTokens}
      outputMint={outputMint}
      onOutputMintChange={setOutputMint}
      swapDirection={swapDirection}
      onToggleDirection={handleToggleDirection}
    />
  );
}
