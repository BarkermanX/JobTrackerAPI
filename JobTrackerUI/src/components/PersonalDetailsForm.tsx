import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
    getPersonalDetails,
    savePersonalDetails,
    type PersonalDetails as PersonalDetailsData,
} from "../api/personalDetailsApi";

interface PersonalDetailsFormProps {
    onSaved: (details: PersonalDetailsData) => void;
    onCancel: () => void;
}

const emptyDetails: PersonalDetailsData = {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    professionalSummary: "",
};

export default function PersonalDetailsForm({
    onSaved,
    onCancel,
}: PersonalDetailsFormProps) {
    const [formData, setFormData] = useState<PersonalDetailsData>(emptyDetails);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [loadAttempt, setLoadAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        getPersonalDetails(controller.signal)
            .then(details => {
                setFormData(details);
                setHasLoaded(true);
            })
            .catch((loadError: unknown) => {
                if (controller.signal.aborted) return;
                console.error("Unable to load personal details:", loadError);
                setError(loadError instanceof Error
                    ? loadError.message
                    : "Unable to load personal details.");
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [loadAttempt]);

    const handleChange = (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = event.target;
        setFormData(previous => ({ ...previous, [name]: value }));
        setSaved(false);
    };

    const handleSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setSaved(false);

        try {
            setSaving(true);
            const savedDetails = await savePersonalDetails(formData);
            setFormData(savedDetails);
            onSaved(savedDetails);
            setSaved(true);

            try {
                const refreshedDetails = await getPersonalDetails();
                setFormData(refreshedDetails);
                onSaved(refreshedDetails);
            } catch (refreshError) {
                console.error("Unable to refresh saved personal details:", refreshError);
                setSaved(false);
                setError("Your details were saved, but the latest values could not be reloaded.");
            }
        } catch (saveError) {
            console.error("Unable to save personal details:", saveError);
            setError(saveError instanceof Error
                ? saveError.message
                : "Unable to save personal details.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="expectations-form-message">Loading your personal details…</p>;
    }

    if (!hasLoaded) {
        return (
            <div className="expectations-form-message" role="alert">
                <p>{error || "Unable to load your personal details."}</p>
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
        <form className="expectations-form personal-details-form" onSubmit={handleSave}>
            <div className="expectations-form-grid">
                <label className="expectations-form-field" htmlFor="profileFullName">
                    <span>Full name</span>
                    <input
                        id="profileFullName"
                        name="fullName"
                        type="text"
                        maxLength={120}
                        autoComplete="name"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Your name"
                    />
                </label>

                <label className="expectations-form-field" htmlFor="profileEmail">
                    <span>Email address</span>
                    <input
                        id="profileEmail"
                        name="email"
                        type="email"
                        maxLength={254}
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                    />
                </label>

                <label className="expectations-form-field" htmlFor="profilePhone">
                    <span>Phone number</span>
                    <input
                        id="profilePhone"
                        name="phone"
                        type="tel"
                        maxLength={40}
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Your contact number"
                    />
                </label>

                <label className="expectations-form-field" htmlFor="profileLocation">
                    <span>Location</span>
                    <input
                        id="profileLocation"
                        name="location"
                        type="text"
                        maxLength={120}
                        autoComplete="address-level2"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="City, town or region"
                    />
                </label>

                <label className="expectations-form-field expectations-form-wide" htmlFor="professionalSummary">
                    <span>Professional summary</span>
                    <textarea
                        id="professionalSummary"
                        name="professionalSummary"
                        maxLength={1000}
                        rows={4}
                        value={formData.professionalSummary}
                        onChange={handleChange}
                        placeholder="A short introduction to your experience, strengths and goals."
                    />
                    <small>{formData.professionalSummary.length}/1000 characters</small>
                </label>
            </div>

            {error && <p className="expectations-form-error" role="alert">{error}</p>}
            {saved && <p className="expectations-form-success" role="status">Your personal details have been saved and refreshed.</p>}

            <div className="expectations-form-actions">
                <button className="expectations-cancel-button" type="button" onClick={onCancel} disabled={saving}>
                    Close
                </button>
                <button className="expectations-save-button" type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save personal details"}
                </button>
            </div>
        </form>
    );
}
