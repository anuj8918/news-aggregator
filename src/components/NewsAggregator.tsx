import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import styled from "styled-components";

const Container = styled.div`
  min-height: 100vh;
  background-color: #f3f4f6;
  padding: 24px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 24px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
`;

const Button = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  margin: 0 8px;
  border-radius: 8px;
  color: #fff;
  background-color: ${(props) => (props.$active ? "#2563eb" : "#6b7280")};
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${(props) => (props.$active ? "#1d4ed8" : "#4b5563")};
  }
`;

const LoadingState = styled.p`
  text-align: center;
  color: #4b5563;
`;
const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const NewsCard = styled.div`
  background-color: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  img {
    width: 100%;
    height: 192px;
    object-fit: cover;
    border-radius: 8px;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: bold;
    margin-top: 8px;
  }

  p {
    color: #4b5563;
    font-size: 0.875rem;
    margin-top: 4px;
  }

  a {
    display: block;
    margin-top: 16px;
    color: #2563eb;
    font-weight: bold;
    text-decoration: none;

    &:hover {
      color: #1d4ed8;
    }
  }
`;

const PaginationButtonsContainer = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const PaginationButton = styled.button<{ disabled: boolean }>`
  padding: 8px 16px;
  margin-right: 10px;
  border-radius: 5px;
  border: none;
  background: #2563eb;
  color: #fff;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
`;

const PaginationText = styled.span`
  margin: 0px 10px;
`;

const SearchContainer = styled.div`
  text-align: center;
  margin-bottom: 16px;
`;

const SearchBox = styled.input`
  padding: 10px;
  width: 100%;
  max-width: 500px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #2563eb;
  }
`;

const fetchNews = async ({
  queryKey,
}: {
  queryKey: [string, string, string, number];
}) => {
  const [, category, searchTerm, currentPage] = queryKey;
  const BACKEND_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5001"
      : process.env.REACT_APP_BACKEND_URL;

  const url = searchTerm
    ? `${BACKEND_URL}/api/news?search=${searchTerm}&page=${currentPage}`
    : `${BACKEND_URL}/api/news?category=${category}&page=${currentPage}`;

  const response = await axios.get(url);
  return response.data.articles || [];
};

const NewsAggregator: React.FC = () => {
  const [category, setCategory] = useState<string>(() => {
    return localStorage.getItem("newsCategory") || "technology";
  });

  const [searchTerm, setSearchTerm] = useState<string>(() => {
    return localStorage.getItem("newsSearch") || "";
  });

  const [currentPage, setCurrentPage] = useState<number>(() => {
    return Number(localStorage.getItem("newsPage")) || 1;
  });

  const {
    data: news = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["news", category, searchTerm, currentPage],
    queryFn: fetchNews,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleCategoryButtonClick = (newCategory: string) => {
    // only update if different
    if (newCategory !== category) {
      setCategory(newCategory);
      setCurrentPage(1);
      localStorage.setItem("newsCategory", newCategory);
      localStorage.setItem("newsPage", "1");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    localStorage.setItem("newsSearch", value);
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => {
      const newPage = prev + 1;
      localStorage.setItem("newsPage", newPage.toString());
      return newPage;
    });
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => {
      const newPage = Math.max(prev - 1, 1);
      localStorage.setItem("newsPage", newPage.toString());
      return newPage;
    });
  };

  return (
    <Container>
      <Title>News Aggregator</Title>
      <SearchContainer>
        <SearchBox
          type="text"
          placeholder="Search for news..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </SearchContainer>
      <ButtonGroup>
        {[
          "technology",
          "business",
          "entertainment",
          "health",
          "science",
          "sports",
        ].map((cat) => (
          <Button
            key={cat}
            onClick={() => handleCategoryButtonClick(cat)}
            $active={category === cat}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </ButtonGroup>
      {error ? (
        <LoadingState>{error.message}</LoadingState>
      ) : loading ? (
        <LoadingState>Loading news...</LoadingState>
      ) : (
        <>
          <NewsGrid>
            {news.map((article: any, index: any) => (
              <NewsCard key={index}>
                {article.urlToImage && (
                  <img src={article.urlToImage} alt={article.title} />
                )}
                <h2>{article.title}</h2>
                <p>{article.source.name}</p>
                <p>{article.description}</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  Read more
                </a>
              </NewsCard>
            ))}
          </NewsGrid>
          <PaginationButtonsContainer>
            <PaginationButton
              disabled={currentPage === 1} // Disable "Previous" on first page
              onClick={handlePrevPage}
            >
              Previous
            </PaginationButton>
            <PaginationText>Page {currentPage}</PaginationText>
            <PaginationButton
              disabled={news.length === 0} // Disable "Next" when no more results
              onClick={handleNextPage}
            >
              Next
            </PaginationButton>
          </PaginationButtonsContainer>
        </>
      )}
    </Container>
  );
};

export default NewsAggregator;
