import axios from "axios";
import { Modal, Spinner } from "react-bootstrap";
import { useInfiniteQuery } from "react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import { UNI_SAT_API_URL } from "../../utils/constants";

import { backendAxios } from "../../utils/axiosInstances";
import { useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { defaultTokenImg } from "../../utils/helpers";

export const SelectTokenModal = ({ open, onClose, onSelect }) => {
  const [search, setSearch] = useState("");
  const searchDebounce = useDebounce(search, 500);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["search-tokens", searchDebounce],
      queryFn: ({ pageParam = 1 }) =>
        backendAxios
          .get("/api/v1/swap/tokens/search", {
            params: { q: searchDebounce, page: pageParam, size: 10 },
          })
          .then((res) => res.data),
      getNextPageParam: (lastPages, pages) => {
        if (lastPages.length < 10) return undefined;

        return pages.length + 1;
      },
    });

  const pages = data?.pages ?? [];
  const items = pages.reduce((acc, curr) => [...acc, ...curr], []) ?? [];

  return (
    <Modal
      className='buy-modal'
      centered
      size='md'
      show={open}
      onHide={onClose}
    >
      <Modal.Header closeButton>
        <Modal.Title>Select Token</Modal.Title>
      </Modal.Header>
      <Modal.Body className='pt-2'>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type='text'
          placeholder='Search token name or ticker'
        />
        {isLoading ? (
          <div className='d-flex align-items-center justify-content-center'>
            <Spinner animation='border' />
          </div>
        ) : (
          <ul className='items-token d-grid gap-2 gap-sm-3' id='scrollableDiv'>
            {items.length == 0 ? (
              <li>
                <p className='text-center'>Nothing found.</p>
              </li>
            ) : (
              <InfiniteScroll
                dataLength={items.length}
                next={fetchNextPage}
                hasMore={hasNextPage}
                loader={
                  isFetchingNextPage && (
                    <li>
                      <p className='text-center'>Loading...</p>
                    </li>
                  )
                }
                endMessage={
                  pages.length > 1 && (
                    <li>
                      <p className='text-center'>No more data to load.</p>
                    </li>
                  )
                }
                scrollableTarget='scrollableDiv'
              >
                {items.map((item, index, pagination) => (
                  <li
                    className='d-flex align-items-center gap-2 justify-content-between'
                    key={index}
                    onClick={() => onSelect(item)}
                  >
                    <div className='d-flex align-items-center gap-2'>
                      <img
                        src={item?.image == "" ? defaultTokenImg : item?.image}
                        alt=''
                      />
                      <span>{item?.tick?.toUpperCase()}</span>
                    </div>
                    {/* <h6 className='mb-0 fw-normal'>{item.available}</h6> */}
                  </li>
                ))}
              </InfiniteScroll>
            )}
          </ul>
        )}
      </Modal.Body>
    </Modal>
  );
};
