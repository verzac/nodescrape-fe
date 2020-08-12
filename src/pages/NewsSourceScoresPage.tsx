import PageSection from "../components/PageSection";
import { Typography, LinearProgress, Box, makeStyles } from "@material-ui/core";
import Explanation from "../components/Explanation";
import FilterBox, { Filters } from "../components/FilterBox";
import ScoreChart from "../components/ScoreChart";
import AverageNewsScoreCard from "../components/AverageNewsScoreCard";
import MedianNewsScoreCard from "../components/MedianNewsScoreCard";
import React from "react";
import NewsSourceScoreService, {
  NewsSourceScore,
} from "../services/NewsSourceScoreService";
import MagGlassIcon from "../assets/magnifying_glass_icon.svg";
import NewsSourceScoreDisplay from "../components/NewsSourceScoreDisplay";

const useStyles = makeStyles((theme) => ({
  dataCard: {
    margin: theme.spacing(2),
  },
  logo: {
    maxWidth: "128px",
    maxHeight: "128px",
  },
  filter: {
    flexBasis: "128px",
  },
}));

const HomePage: React.FC = (props) => {
  const [newsSourceScores, setNewsSourceScores] = React.useState<Array<
    NewsSourceScore
  > | null>(null);
  const [displayedScores, setDisplayedScores] = React.useState<Array<
    NewsSourceScore
  > | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<any | null>(null);
  const [filters, setFilters] = React.useState<Filters>({
    country: "",
    name: "",
  });
  const timeoutToken = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const classes = useStyles();
  React.useEffect(() => {
    setIsLoading(true);
    NewsSourceScoreService.getNewsScores()
      .then((res) => {
        setNewsSourceScores(res.sort((a, b) => b.score - a.score));
      })
      .catch((e) => {
        console.error(e);
        setError(e);
      })
      .finally(() => setIsLoading(false));
  }, []);
  React.useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);
  React.useEffect(() => {
    if (timeoutToken.current) {
      clearTimeout(timeoutToken.current);
    }
    timeoutToken.current = setTimeout(() => {
      if (newsSourceScores) {
        let scoresToDisplay = newsSourceScores;
        if (filters.country) {
          scoresToDisplay = scoresToDisplay.filter(
            (score) => score.country === filters.country
          );
        }
        if (filters.name) {
          scoresToDisplay = scoresToDisplay.filter((score) =>
            score.name.toLowerCase().includes(filters.name.toLowerCase())
          );
        }
        setDisplayedScores(scoresToDisplay);
      }
    }, 200);
  }, [newsSourceScores, filters]);
  return (
    <>
      <PageSection>
        <img
          className={classes.logo}
          src={MagGlassIcon}
          alt="Logo"
          aria-label="logo"
        />
        <Typography variant="h1">News Neutrality Watcher</Typography>
        <Typography variant="subtitle1">
          How positive/negative is your news source?
        </Typography>
        <Explanation />
      </PageSection>
      <PageSection>
        {isLoading && <LinearProgress />}
        {error && (
          <Typography color="error">
            An error has occurred. Please try again later.
          </Typography>
        )}
      </PageSection>
      {newsSourceScores &&
        displayedScores &&
        (newsSourceScores.length ? (
          <>
            <PageSection>
              <FilterBox
                newsSourceScores={newsSourceScores}
                onFilterChange={(newFilters) => setFilters(newFilters)}
              />
            </PageSection>
            {Boolean(displayedScores.length) ? (
              <>
                <PageSection>
                  <ScoreChart newsSourceScores={displayedScores} />
                </PageSection>
                <PageSection>
                  <Box
                    display="flex"
                    flexDirection="row"
                    justifyContent="center"
                    flexWrap="wrap"
                  >
                    <div className={classes.dataCard}>
                      <AverageNewsScoreCard
                        newsSourceScores={displayedScores}
                      />
                    </div>
                    <div className={classes.dataCard}>
                      <MedianNewsScoreCard newsSourceScores={displayedScores} />
                    </div>
                  </Box>
                </PageSection>
                <PageSection>
                  <NewsSourceScoreDisplay newsSourceScores={displayedScores} />
                </PageSection>
              </>
            ) : (
              <Typography>No matching news sources can be found.</Typography>
            )}
          </>
        ) : (
          <Typography variant="h3">
            We can't seem to find any data. Please come back again later!
          </Typography>
        ))}
    </>
  );
};

export default HomePage;
