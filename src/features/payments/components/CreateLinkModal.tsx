'use client';

import React from 'react';
import {
  Plus,
  Loader2,
  X,
  Image as ImageLucide,
  Percent,
  FileText,
  Calendar,
  Truck,
  Phone,
  CheckCircle2,
  Eye,
  Zap,
} from 'lucide-react';
import {
  Overlay,
  ModalBox,
  ModalCloseButton,
  FormHeader,
  ModalFormActions,
  BuilderGrid,
  TabList,
  TabButton,
  CheckboxLabel,
  LivePreviewCard,
  LivePreviewBadge,
  PreviewImageWrapper,
  PreviewTitle,
  PreviewPrice,
  InputGrid,
  InputGroup,
  Label,
  Input,
  Textarea,
  Select,
  Button,
} from '@/features/payments/components/payment-links.styles';
import type { LinkBuilderForm } from '@/features/payments/hooks/useLinkBuilderForm';
import type { TokenMetadata } from '@/context/TokenRegistryContext';

interface CreateLinkModalProps {
  form: LinkBuilderForm;
  tokens: TokenMetadata[];
  creating: boolean;
  isFormValid: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

/** "Create Payment Link" builder (product, pricing, checkout and limits tabs). */
export function CreateLinkModal({ form, tokens, creating, isFormValid, onClose, onSubmit }: CreateLinkModalProps) {
  const {
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
  } = form;

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => !creating && onClose()}
    >
      <ModalBox
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
      >
        <ModalCloseButton type="button" onClick={() => !creating && onClose()} aria-label="Close">
          <X size={16} />
        </ModalCloseButton>

        <form onSubmit={onSubmit}>
          <FormHeader>
            <Plus size={20} /> Create Payment Link
          </FormHeader>

          <TabList>
            <TabButton
              type="button"
              $active={activeTab === 'general'}
              onClick={() => setActiveTab('general')}
            >
              <ImageLucide size={14} /> Product & Visuals
            </TabButton>
            <TabButton
              type="button"
              $active={activeTab === 'pricing'}
              onClick={() => setActiveTab('pricing')}
            >
              <Percent size={14} /> Pricing & Web3
            </TabButton>
            <TabButton
              type="button"
              $active={activeTab === 'checkout'}
              onClick={() => setActiveTab('checkout')}
            >
              <FileText size={14} /> Customer Info
            </TabButton>
            <TabButton
              type="button"
              $active={activeTab === 'limits'}
              onClick={() => setActiveTab('limits')}
            >
              <Calendar size={14} /> Limits & Inventory
            </TabButton>
          </TabList>

          <BuilderGrid>
            <div>
              {activeTab === 'general' && (
                <InputGrid>
                  <InputGroup>
                    <Label>Business / Store Name</Label>
                    <Input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Coffee & Co"
                      required
                    />
                  </InputGroup>

                  <InputGroup>
                    <Label>Product or Service Title</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. VIP Yearly Membership"
                      required
                    />
                  </InputGroup>

                  <InputGroup>
                    <Label>Product Image URL (Optional)</Label>
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-1512496015851-a90fb38ba796"
                    />
                  </InputGroup>

                  <InputGroup>
                    <Label>Description</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide details about what the customer is purchasing..."
                    />
                  </InputGroup>

                  <InputGroup>
                    <Label>Key Bullet Points (1 per line)</Label>
                    <Textarea
                      value={featuresText}
                      onChange={(e) => setFeaturesText(e.target.value)}
                      placeholder={"✓ Instant Digital Access\n✓ 24/7 VIP Support\n✓ Annual Updates Included"}
                    />
                  </InputGroup>

                  <InputGroup>
                    <Label>Category</Label>
                    <Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Subscription">Subscription</option>
                      <option value="Digital Service">Digital Service</option>
                      <option value="Software / SaaS">Software / SaaS</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Physical Product">Physical Product</option>
                      <option value="Donation / Tip">Donation / Tip</option>
                    </Select>
                  </InputGroup>
                </InputGrid>
              )}

              {activeTab === 'pricing' && (
                <InputGrid>
                  <InputGroup>
                    <Label>Pricing Model</Label>
                    <Select
                      value={pricingType}
                      onChange={(e) => setPricingType(e.target.value as 'fixed' | 'custom')}
                    >
                      <option value="fixed">Fixed Price (Defined Amount)</option>
                      <option value="custom">Pay What You Want / Tip / Donation</option>
                    </Select>
                  </InputGroup>

                  {pricingType === 'fixed' && (
                    <InputGroup>
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        step="any"
                        min="0.000001"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </InputGroup>
                  )}

                  <InputGroup>
                    <Label>Settlement Currency</Label>
                    <Select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <optgroup label="Available Tokens">
                        {tokens.map((token) => (
                          <option key={token.symbol} value={token.symbol}>
                            {token.symbol} ({token.name})
                          </option>
                        ))}
                      </optgroup>
                    </Select>
                  </InputGroup>

                  <InputGroup>
                    <Label>Treasury Vault Account</Label>
                    <Select
                      value={destinationAccount}
                      onChange={(e) => setDestinationAccount(e.target.value)}
                    >
                      <option value="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU">
                        Main Treasury Vault (7xKXtg...sgAsU)
                      </option>
                      <option value="HSVNd78A1yP84k2PqN9s72">
                        Operations Vault (HSVNd7...PqN)
                      </option>
                    </Select>
                  </InputGroup>

                  <InputGroup>
                    <Label>⚡ $LXR Web3 Payment Discount (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={lxrDiscount}
                      onChange={(e) => setLxrDiscount(e.target.value)}
                      placeholder="e.g. 5 for 5% discount when paying in $LXR"
                    />
                  </InputGroup>

                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={allowQuantity}
                      onChange={(e) => setAllowQuantity(e.target.checked)}
                    />
                    <span>Allow customer to adjust item quantity (1, 2, 5...)</span>
                  </CheckboxLabel>
                </InputGrid>
              )}

              {activeTab === 'checkout' && (
                <InputGrid>
                  <Label>Collect Customer Information</Label>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={collectShipping}
                      onChange={(e) => setCollectShipping(e.target.checked)}
                    />
                    <span><Truck size={14} style={{ display: 'inline', marginRight: 6 }} /> Collect Shipping & Billing Address</span>
                  </CheckboxLabel>

                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={collectPhone}
                      onChange={(e) => setCollectPhone(e.target.checked)}
                    />
                    <span><Phone size={14} style={{ display: 'inline', marginRight: 6 }} /> Collect Customer Phone Number</span>
                  </CheckboxLabel>

                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={collectTaxId}
                      onChange={(e) => setCollectTaxId(e.target.checked)}
                    />
                    <span><FileText size={14} style={{ display: 'inline', marginRight: 6 }} /> Collect Tax ID / RUT / RIF / DNI</span>
                  </CheckboxLabel>

                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={collectCustomNote}
                      onChange={(e) => setCollectCustomNote(e.target.checked)}
                    />
                    <span>Collect Special Instructions / Note from Customer</span>
                  </CheckboxLabel>

                  <InputGroup style={{ marginTop: 12 }}>
                    <Label>Post-Payment Redirect URL (Success Page)</Label>
                    <Input
                      value={redirectUrl}
                      onChange={(e) => setRedirectUrl(e.target.value)}
                      placeholder="https://yourstore.com/thank-you"
                    />
                  </InputGroup>
                </InputGrid>
              )}

              {activeTab === 'limits' && (
                <InputGrid>
                  <InputGroup>
                    <Label>Stock / Max Payment Redemptions (Optional)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={maxUses}
                      onChange={(e) => setMaxUses(e.target.value)}
                      placeholder="e.g. 50 (link disables after 50 uses)"
                    />
                  </InputGroup>

                  <InputGroup>
                    <Label>Expiration Date (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                    />
                  </InputGroup>

                  <InputGroup>
                    <Label>SKU / Reference Code (Optional)</Label>
                    <Input
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="e.g. LXR-VIP-2026"
                    />
                  </InputGroup>
                </InputGrid>
              )}
            </div>

            {/* Live Card Preview */}
            <LivePreviewCard>
              <LivePreviewBadge>
                <Eye size={12} /> Live Link Preview
              </LivePreviewBadge>

              <PreviewImageWrapper>
                {imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={imageUrl}
                    alt="Product Preview"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                    <ImageLucide size={32} style={{ margin: '0 auto 6px', opacity: 0.5 }} />
                    <div>No Image Added</div>
                  </div>
                )}
              </PreviewImageWrapper>

              <div>
                <div style={{ fontSize: 11, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 2 }}>
                  {businessName || 'Your Business Name'}
                </div>
                <PreviewTitle>{name || 'Product / Service Title'}</PreviewTitle>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4, lineHeight: 1.4 }}>
                  {description || 'Product description will appear here...'}
                </div>
              </div>

              {featuresText.trim().length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                  {featuresText.split('\n').filter(Boolean).map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={13} color="#34D399" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}

              <PreviewPrice>
                {pricingType === 'custom' ? (
                  'Custom Amount'
                ) : (
                  <>
                    {amount || '0.00'} <span>{currency}</span>
                  </>
                )}
              </PreviewPrice>

              {parseFloat(lxrDiscount) > 0 && (
                <div style={{ background: 'rgba(96, 165, 250, 0.12)', border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: 10, padding: '6px 10px', fontSize: 11, color: '#60A5FA', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={13} /> Save {lxrDiscount}% paying with $LXR Token
                </div>
              )}

              <Button type="button" $variant="primary" style={{ width: '100%', marginTop: 8 }} disabled>
                Pay Now with Solana
              </Button>
            </LivePreviewCard>
          </BuilderGrid>

          <ModalFormActions>
            <Button type="button" $variant="secondary" onClick={() => onClose()} disabled={creating}>
              Cancel
            </Button>
            <Button type="submit" $variant="primary" disabled={creating || !isFormValid}>
              {creating ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Plus size={16} /> Create Payment Link
                </>
              )}
            </Button>
          </ModalFormActions>
        </form>
      </ModalBox>
    </Overlay>
  );
}
