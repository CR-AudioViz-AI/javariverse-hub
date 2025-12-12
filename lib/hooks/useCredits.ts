// lib/hooks/useCredits.ts
// Credit System Hooks - For use across all apps
// Timestamp: Dec 11, 2025 10:39 PM EST

'use client';

import { useState, useCallback } from 'react';

interface CreditBalance {
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
}

interface UseCreditsOptions {
  userId: string;
  appId?: string;
}

interface CreditCheckResult {
  hasEnough: boolean;
  balance: number;
  required: number;
}

interface CreditDeductResult {
  success: boolean;
  previousBalance: number;
  newBalance: number;
  deducted: number;
  error?: string;
}

export function useCredits({ userId, appId }: UseCreditsOptions) {
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current balance
  const fetchBalance = useCallback(async () => {
    if (!userId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/credits?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setBalance(data.credits);
        return data.credits;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch balance';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Check if user has enough credits
  const checkCredits = useCallback(async (amount: number): Promise<CreditCheckResult> => {
    try {
      const response = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check',
          userId,
          amount,
        }),
      });
      
      return response.json();
    } catch (err) {
      return { hasEnough: false, balance: 0, required: amount };
    }
  }, [userId]);

  // Deduct credits for an operation
  const deductCredits = useCallback(async (
    amount: number, 
    operationId: string,
    reason?: string
  ): Promise<CreditDeductResult> => {
    try {
      const response = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deduct',
          userId,
          amount,
          appId,
          operationId,
          reason,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local balance
        setBalance(prev => prev ? {
          ...prev,
          balance: data.newBalance,
          lifetime_spent: prev.lifetime_spent + amount,
        } : null);
      }
      
      return data;
    } catch (err) {
      return {
        success: false,
        previousBalance: balance?.balance || 0,
        newBalance: balance?.balance || 0,
        deducted: 0,
        error: err instanceof Error ? err.message : 'Failed to deduct credits',
      };
    }
  }, [userId, appId, balance]);

  // Refund credits for a failed operation
  const refundCredits = useCallback(async (
    amount: number,
    operationId: string,
    reason?: string
  ) => {
    try {
      const response = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refund',
          userId,
          amount,
          appId,
          operationId,
          reason,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBalance(prev => prev ? {
          ...prev,
          balance: data.newBalance,
        } : null);
      }
      
      return data;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to refund credits',
      };
    }
  }, [userId, appId]);

  // Wrapper for credit-consuming operations with auto-refund
  const withCredits = useCallback(async <T>(
    amount: number,
    operation: () => Promise<T>,
    operationId?: string
  ): Promise<{ success: boolean; result?: T; error?: string }> => {
    const opId = operationId || `op_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    // Step 1: Check credits
    const check = await checkCredits(amount);
    if (!check.hasEnough) {
      return { 
        success: false, 
        error: `Insufficient credits. Need ${amount}, have ${check.balance}` 
      };
    }
    
    // Step 2: Deduct credits
    const deduction = await deductCredits(amount, opId);
    if (!deduction.success) {
      return { success: false, error: deduction.error };
    }
    
    // Step 3: Execute operation
    try {
      const result = await operation();
      return { success: true, result };
    } catch (err) {
      // Step 4: Auto-refund on failure
      await refundCredits(amount, opId, 'Operation failed - auto-refund');
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Operation failed' 
      };
    }
  }, [checkCredits, deductCredits, refundCredits]);

  return {
    balance,
    loading,
    error,
    fetchBalance,
    checkCredits,
    deductCredits,
    refundCredits,
    withCredits,
  };
}

export default useCredits;
