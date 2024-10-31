import React, { useState } from "react";
import { TransactionModal } from "./TransactionModal";

export const TransactionRow = ({ item }) => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  if (!item) return null;

  const date = new Date(item.createdAt);
  const auctionItem = (item.outputInscriptions ?? [])[0];

  return (
    <>
      <tr
        role='button'
        onClick={() => setShowTransactionModal(true)}
        className='cursor-pointer'
      >
        <td>{date?.toLocaleString()}</td>
        <td>{item.chain}</td>
        <td>{item.amountWithFees}</td>
        <td>{auctionItem?.tick?.toUpperCase()}</td>
        <td>{auctionItem?.amount}</td>
        <td>{item.status === "Failed" ? "Refunded" : item.status}</td>
      </tr>
      {showTransactionModal && (
        <TransactionModal
          open={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          status={item.status}
          txHash={item.txHash}
          refundTxHash={item.refundTxHash}
          txid={auctionItem?.txid}
          ticker={auctionItem?.tick}
        />
      )}
    </>
  );
};
