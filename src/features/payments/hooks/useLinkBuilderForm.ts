import { useState } from 'react';

/** Draft of the "Create Payment Link" builder. Lives in the page so it survives closing the modal. */
export function useLinkBuilderForm() {
  // Create state
  const [destinationAccount, setDestinationAccount] = useState('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Subscription');
  const [sku, setSku] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<string>('USDC');

  // New Stripe-like fields
  const [imageUrl, setImageUrl] = useState('');
  const [pricingType, setPricingType] = useState<'fixed' | 'custom'>('fixed');
  const [allowQuantity, setAllowQuantity] = useState(false);
  const [featuresText, setFeaturesText] = useState('');
  const [collectShipping, setCollectShipping] = useState(false);
  const [collectPhone, setCollectPhone] = useState(false);
  const [collectTaxId, setCollectTaxId] = useState(false);
  const [collectCustomNote, setCollectCustomNote] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [lxrDiscount, setLxrDiscount] = useState('0');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'checkout' | 'limits'>('general');

  return {
    destinationAccount,
    setDestinationAccount,
    name,
    setName,
    businessName,
    setBusinessName,
    description,
    setDescription,
    category,
    setCategory,
    sku,
    setSku,
    amount,
    setAmount,
    currency,
    setCurrency,
    imageUrl,
    setImageUrl,
    pricingType,
    setPricingType,
    allowQuantity,
    setAllowQuantity,
    featuresText,
    setFeaturesText,
    collectShipping,
    setCollectShipping,
    collectPhone,
    setCollectPhone,
    collectTaxId,
    setCollectTaxId,
    collectCustomNote,
    setCollectCustomNote,
    redirectUrl,
    setRedirectUrl,
    lxrDiscount,
    setLxrDiscount,
    maxUses,
    setMaxUses,
    expiresAt,
    setExpiresAt,
    activeTab,
    setActiveTab,
  };
}

export type LinkBuilderForm = ReturnType<typeof useLinkBuilderForm>;
