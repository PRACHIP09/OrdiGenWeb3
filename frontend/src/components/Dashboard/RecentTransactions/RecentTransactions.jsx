import React, { useState } from "react";
import styles from "./RecentTransactions.module.scss";
import { Pagination, Spinner, Table } from "react-bootstrap";
import { useQuery } from "react-query";
import { backendAxios } from "../../../utils/axiosInstances";
import { useGeneralDataContext } from "../../../hooks/useGeneralDataContext";
import { TransactionRow } from "./TransactionRow";

export const RecentTransactions = () => {
  const { ethAccount, ethNetwork } = useGeneralDataContext();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", ethAccount, page, ethNetwork.name],
    queryFn: () =>
      backendAxios
        .get(`/api/v1/swap/user/${ethAccount}`, {
          params: {
            page: page,
            size: 10,
            chain: ethNetwork.name,
          },
        })
        .then((res) => res.data),
    refetchInterval: 1000 * 30,
  });

  const items = data ?? [];

  return (
    <div className={styles.container}>
      <h3>Recent Transactions</h3>
      <div className={styles.tableContainer}>
        {isLoading ? (
          <div className='d-flex justify-content-center align-items-center'>
            <Spinner animation='border' />
          </div>
        ) : (
          <>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>TX Date/Time</th>
                  <th>Chain</th>
                  <th>Amount Spent</th>
                  <th>BRC20 Token</th>
                  <th>Amount Received</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, index) => {
                    return <TransactionRow item={item} key={item?._id} />;
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className='text-center'>
                      No recent transactions
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div
              className='d-flex justify-content-end'
              style={{ paddingRight: 16 }}
            >
              <Pagination size='sm'>
                <Pagination.Prev
                  disabled={page === 1}
                  onClick={() => setPage((oldPage) => oldPage - 1)}
                />
                <Pagination.Item>{page}</Pagination.Item>
                <Pagination.Next
                  disabled={items.length < 10}
                  onClick={() => setPage((oldPage) => oldPage + 1)}
                />
              </Pagination>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
