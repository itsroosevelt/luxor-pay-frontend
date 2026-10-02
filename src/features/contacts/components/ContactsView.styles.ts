import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

export const spin = keyframes`to { transform: rotate(360deg); }`;

export const PageContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  padding: 36px 40px 64px 40px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 24px 20px 64px 20px;
  }
`;

export const HeaderRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 20px;
`;

export const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: #FFFFFF;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 26px;
  }
`;

export const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  line-height: 1.5;
`;

export const AddButton = styled.button`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 9px 20px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #FFFFFF;
  color: #000000;
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #EDEDED;
    color: #000000;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid #FFFFFF;
    outline-offset: 2px;
  }
`;

export const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const RightControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
`;

export const SearchFilterWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 240px;
  max-width: 430px;
`;

export const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
`;

export const FilterIconButton = styled.button<{ $active?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)')};
  border: 1px solid ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)')};
  color: ${({ $active }) => ($active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:focus-visible {
    outline: 2px solid #FFFFFF;
    outline-offset: 2px;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  padding: 8px 36px 8px 38px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: #FFFFFF;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus-visible {
    outline: none;
    border-color: rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.06);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.35);
  }
`;

export const SearchIconWrapper = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
  display: flex;
  align-items: center;
`;

export const ClearSearchButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;

  &:hover {
    color: #FFFFFF;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const FilterTab = styled.button<{ $active?: boolean }>`
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 9999px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.3)' : 'transparent')};
  background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.06);
  }

  &:focus-visible {
    outline: 2px solid #FFFFFF;
    outline-offset: 2px;
  }
`;

export const ContactsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1280px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const ContactCard = styled(motion.div)`
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: none;
  border-radius: 0;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  gap: 14px;
  transition: opacity 0.2s;
  min-width: 0;

  &:hover {
    opacity: 0.9;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
`;

export const AvatarNameGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

export const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #FFFFFF;
  text-transform: uppercase;
`;

export const NameGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const ContactName = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 17px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const FavoriteBadge = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: #F59E0B;
  display: inline-flex;
  align-items: center;
  gap: 3px;
`;

export const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

export const IconButton = styled.button<{ $active?: boolean; $danger?: boolean; $favorite?: boolean }>`
  background: ${({ $active, $favorite }) =>
    $favorite && $active ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.04)'};
  border: 1px solid ${({ $active, $favorite }) =>
    $favorite && $active ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.06)'};
  border-radius: 8px;
  color: ${({ $active, $favorite }) =>
    $favorite && $active ? '#F59E0B' : $active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)'};
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: ${({ $favorite }) => ($favorite ? '#F59E0B' : '#FFFFFF')};
    background: ${({ $favorite }) => ($favorite ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)')};
    border-color: ${({ $favorite }) => ($favorite ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.15)')};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #F59E0B;
    outline-offset: 2px;
  }
`;

export const AddressPill = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
`;

export const AddressMonospace = styled.span`
  font-family: monospace;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const AddressActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

export const MiniButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 3px;
  display: flex;
  align-items: center;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.06);
  }
`;

export const DataGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 12px;
  min-width: 0;
`;

export const DataRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  min-width: 0;
`;

export const Label = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
  flex-shrink: 0;
`;

export const Value = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  text-align: right;
`;

export const SendLinkButton = styled.button`
  margin-top: auto;
  width: 100%;
  font-family: 'Outfit', sans-serif;
  font-size: 12.5px;
  font-weight: 500;
  padding: 8px 14px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: #E2E8F0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: #FFFFFF;
    color: #000000;
    border-color: #FFFFFF;
    box-shadow: 0 4px 16px rgba(255, 255, 255, 0.15);
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  gap: 16px;
`;

export const EmptyTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
`;

export const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;
