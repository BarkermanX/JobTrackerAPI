import { useEffect, useState } from "react";
import { apiFetch } from "../../api";

interface AdzunaJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  redirectUrl: string;
  created: string;
  salaryMin: number | null;
  salaryMax: number | null;
}

interface AdzunaSearchResponse {
  results: AdzunaJob[];
  count: number;
}

async function getErrorMessage(response: Response): Promise<string> {
  const body = await response.text();

  if (body) {
    try {
      const problem = JSON.parse(body) as { detail?: string; title?: string };
      if (problem.detail || problem.title) {
        return problem.detail || problem.title || `Search failed (${response.status}).`;
      }
    } catch {
      return body;
    }
  }

  return `Search failed (${response.status}).`;
}

function formatSalary(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;

  const format = (amount: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(amount);

  if (min !== null && max !== null) return `${format(min)} – ${format(max)}`;
  return min !== null ? `From ${format(min)}` : `Up to ${format(max!)}`;
}

function AdzunaJobSearch() {
  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");
  const [jobs, setJobs] = useState<AdzunaJob[]>([]);
  const [resultCount, setResultCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const query = what.trim();

    if (query.length < 2) return;

    const controller = new AbortController();

    const timeout = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ what: query });
        if (where.trim()) params.set("where", where.trim());

        const response = await apiFetch(`/api/JobSearch/adzuna?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        const data: AdzunaSearchResponse = await response.json();
        setJobs(data.results);
        setResultCount(data.count);
      } catch (searchError) {
        if (controller.signal.aborted) return;
        setError(searchError instanceof Error ? searchError.message : "Job search failed.");
        setJobs([]);
        setResultCount(0);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 650);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [what, where]);

  return (
    <section className="dashboard-card adzuna-card" id="job-search" aria-labelledby="job-search-title">
      <div className="card-heading adzuna-heading">
        <div className="card-title-wrap">
          <span className="card-icon card-icon-purple" aria-hidden="true">⌕</span>
          <div>
            <h2 id="job-search-title">Job search results</h2>
            <p>Find matching opportunities with Adzuna</p>
          </div>
        </div>
        <span className="adzuna-brand"><span aria-hidden="true">↗</span> ADZUNA</span>
      </div>

      <div className="adzuna-filters">
        <label>
          <span>JOB TITLE OR KEYWORD</span>
          <input
            type="search"
            value={what}
            onChange={(event) => {
              const value = event.target.value;
              setWhat(value);
              if (value.trim().length < 2) {
                setJobs([]);
                setResultCount(0);
                setLoading(false);
                setError("");
              } else {
                setLoading(true);
                setError("");
              }
            }}
            placeholder="e.g. Product designer"
            autoComplete="off"
          />
        </label>
        <label>
          <span>LOCATION</span>
          <input
            type="search"
            value={where}
            onChange={(event) => {
              setWhere(event.target.value);
              if (what.trim().length >= 2) {
                setLoading(true);
                setError("");
              }
            }}
            placeholder="e.g. Manchester"
            autoComplete="off"
          />
        </label>
      </div>

      <div className="adzuna-results-heading" aria-live="polite">
        {loading ? (
          <span>Searching Adzuna…</span>
        ) : error ? (
          <span className="adzuna-error">{error}</span>
        ) : what.trim().length >= 2 ? (
          <span>{resultCount.toLocaleString("en-GB")} matching jobs</span>
        ) : (
          <span>Enter a job title to search automatically</span>
        )}
      </div>

      {jobs.length > 0 ? (
        <div className="adzuna-job-list">
          {jobs.map((job) => {
            const salary = formatSalary(job.salaryMin, job.salaryMax);
            return (
              <article className="adzuna-job" key={job.id}>
                <div className="adzuna-job-main">
                  <h3><a href={job.redirectUrl} target="_blank" rel="noreferrer">{job.title}</a></h3>
                  <p className="adzuna-job-company">{job.company} <span>·</span> {job.location}</p>
                  <p className="adzuna-job-description">{job.description}</p>
                </div>
                <div className="adzuna-job-meta">
                  {salary && <span className="adzuna-salary">{salary}</span>}
                  {job.created && (
                    <time dateTime={job.created}>
                      {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(job.created))}
                    </time>
                  )}
                  <a href={job.redirectUrl} target="_blank" rel="noreferrer" className="adzuna-view-link">
                    View job <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="adzuna-empty">
          <span className="empty-icon" aria-hidden="true">{error ? "!" : "⌕"}</span>
          <strong>{error ? "We couldn’t load job results" : loading ? "Searching for matching roles…" : what.trim().length >= 2 ? "No matching roles found" : "Your next opportunity is out there"}</strong>
          <p>{error ? "Check your connection or try again in a moment." : "Enter a role above and we’ll search current UK listings for you."}</p>
        </div>
      )}

      <div className="adzuna-attribution">
        <span>Search results provided by</span>
        <a href="https://www.adzuna.co.uk/" target="_blank" rel="noreferrer">Adzuna</a>
        <span>· UK listings</span>
      </div>
    </section>
  );
}

export default AdzunaJobSearch;
