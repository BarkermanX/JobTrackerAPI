import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
    getJobExpectations,
    saveJobExpectations,
    type JobExpectations as JobExpectationsData,
} from "../api/jobExpectationsApi";

interface JobExpectationsFormProps {
    onSaved: (expectations: JobExpectationsData) => void;
    onCancel: () => void;
}

export default function JobExpectationsForm({
    onSaved,
    onCancel,
}: JobExpectationsFormProps) {
    const [formData, setFormData] = useState<JobExpectationsData>({
        jobTitles: [],
        companyPreferences: [],
        location: "",
        maxCommuteMinutes: 30,
        minimumSalary: 50000,
        maximumSalary: 60000,
        remote: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [loadAttempt, setLoadAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        getJobExpectations(controller.signal)
            .then(expectations => {
                setFormData(expectations);
                setHasLoaded(true);
            })
            .catch((loadError: unknown) => {
                if (controller.signal.aborted) return;
                console.error("Unable to load job expectations:", loadError);
                setError(loadError instanceof Error
                    ? loadError.message
                    : "Unable to load job expectations.");
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [loadAttempt]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = event.target;

        setFormData(previous => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
        setSaved(false);
    };

    const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData(previous => ({
            ...previous,
            [name]: value === "" ? 0 : Number(value),
        }));
        setSaved(false);
    };

    const handleSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setSaved(false);

        if (formData.minimumSalary > formData.maximumSalary) {
            setError("Maximum salary must be greater than or equal to minimum salary.");
            return;
        }

        try {
            setSaving(true);
            const savedData = await saveJobExpectations(formData);
            setFormData(savedData);
            onSaved(savedData);
            setSaved(true);
            try {
                const refreshedData = await getJobExpectations();
                setFormData(refreshedData);
                onSaved(refreshedData);
            } catch (refreshError) {
                console.error("Unable to refresh saved job expectations:", refreshError);
                setError("Your expectations were saved, but the latest values could not be reloaded.");
            }
        } catch (saveError) {
            console.error("Unable to save job expectations:", saveError);
            setError(saveError instanceof Error
                ? saveError.message
                : "Unable to save job expectations.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="expectations-form-message">Loading your job expectations…</p>;
    }

    if (!hasLoaded) {
        return (
            <div className="expectations-form-message" role="alert">
                <p>{error || "Unable to load your job expectations."}</p>
                <div className="expectations-form-actions">
                    <button
                        className="expectations-cancel-button"
                        type="button"
                        onClick={() => {
                            setError("");
                            setLoading(true);
                            setLoadAttempt(attempt => attempt + 1);
                        }}
                    >
                        Retry
                    </button>
                    <button className="expectations-cancel-button" type="button" onClick={onCancel}>
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form className="expectations-form" onSubmit={handleSave}>
            <div className="expectations-form-grid">
                <label className="expectations-form-field expectations-form-wide" htmlFor="jobTitles">
                    <span>Positions &amp; titles</span>
                    <input
                        id="jobTitles"
                        name="jobTitles"
                        type="text"
                        value={formData.jobTitles.join(", ")}
                        onChange={event => {
                            setFormData(previous => ({
                                ...previous,
                                jobTitles: event.target.value
                                    .split(",")
                                    .map(title => title.trim())
                                    .filter(Boolean),
                            }));
                            setSaved(false);
                        }}
                        placeholder="Senior Software Developer, Product Designer"
                    />
                    <small>Separate multiple titles with commas.</small>
                </label>

                <label className="expectations-form-field expectations-form-wide" htmlFor="companyPreferences">
                    <span>Company preferences</span>
                    <input
                        id="companyPreferences"
                        name="companyPreferences"
                        type="text"
                        value={formData.companyPreferences.join(", ")}
                        onChange={event => {
                            setFormData(previous => ({
                                ...previous,
                                companyPreferences: event.target.value
                                    .split(",")
                                    .map(preference => preference.trim())
                                    .filter(Boolean),
                            }));
                            setSaved(false);
                        }}
                        placeholder="Small, ethical, mission-led"
                    />
                    <small>Separate company size, values or culture preferences with commas.</small>
                </label>

                <label className="expectations-form-field expectations-form-wide" htmlFor="location">
                    <span>Preferred location</span>
                    <input
                        id="location"
                        name="location"
                        type="text"
                        maxLength={120}
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="City, town or region"
                    />
                </label>

                <label className="expectations-form-field" htmlFor="maxCommuteMinutes">
                    <span>Maximum commute</span>
                    <div className="expectations-input-suffix">
                        <input
                            id="maxCommuteMinutes"
                            name="maxCommuteMinutes"
                            type="number"
                            min="0"
                            max="1440"
                            value={formData.maxCommuteMinutes}
                            onChange={handleNumberChange}
                        />
                        <span>minutes</span>
                    </div>
                </label>

                <label className="expectations-form-field" htmlFor="minimumSalary">
                    <span>Minimum salary</span>
                    <div className="expectations-input-prefix">
                        <span>£</span>
                        <input
                            id="minimumSalary"
                            name="minimumSalary"
                            type="number"
                            min="0"
                            max="10000000"
                            value={formData.minimumSalary}
                            onChange={handleNumberChange}
                        />
                    </div>
                </label>

                <label className="expectations-form-field" htmlFor="maximumSalary">
                    <span>Maximum salary</span>
                    <div className="expectations-input-prefix">
                        <span>£</span>
                        <input
                            id="maximumSalary"
                            name="maximumSalary"
                            type="number"
                            min="0"
                            max="10000000"
                            value={formData.maximumSalary}
                            onChange={handleNumberChange}
                        />
                    </div>
                </label>

                <label className="expectations-remote-field">
                    <input
                        name="remote"
                        type="checkbox"
                        checked={formData.remote}
                        onChange={handleChange}
                    />
                    <span>
                        <strong>Include remote roles</strong>
                        <small>Show opportunities that support remote working.</small>
                    </span>
                </label>
            </div>

            {error && <p className="expectations-form-error" role="alert">{error}</p>}
            {saved && <p className="expectations-form-success" role="status">Your expectations have been saved and refreshed.</p>}

            <div className="expectations-form-actions">
                <button className="expectations-cancel-button" type="button" onClick={onCancel} disabled={saving}>
                    Close
                </button>
                <button className="expectations-save-button" type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save expectations"}
                </button>
            </div>
        </form>
    );
}
