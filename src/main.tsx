import { createRoot } from "react-dom/client";
import React, { useEffect, useState } from "react";
import "./index.css";

function Loader() {
	return (
		<div style={{ padding: 20, fontFamily: "system-ui,Segoe UI,Roboto,Arial" }}>
			<h2>Loading app...</h2>
		</div>
	);
}

function ErrorDisplay({ error }: { error: Error | null }) {
	if (!error) return null;
	return (
		<div style={{ padding: 20, fontFamily: "system-ui,Segoe UI,Roboto,Arial" }}>
			<h2 style={{ color: "#b91c1c" }}>Failed to load app</h2>
			<pre style={{ whiteSpace: "pre-wrap", background: "#fff", padding: 12, borderRadius: 6, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
				{error.message}
				{error.stack && "\n\n" + error.stack}
			</pre>
			<p>Open the browser console for more details.</p>
		</div>
	);
}

function DynamicAppLoader() {
	const [AppComp, setAppComp] = useState<React.ComponentType | null>(null);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		let mounted = true;
		import("./App")
			.then((mod) => {
				if (!mounted) return;
				setAppComp(() => (mod.default ?? null));
			})
			.catch((err) => {
				console.error("Dynamic import error:", err);
				setError(err instanceof Error ? err : new Error(String(err)));
			});
		return () => {
			mounted = false;
		};
	}, []);

	if (error) return <ErrorDisplay error={error} />;
	if (!AppComp) return <Loader />;
	const App = AppComp;
	return <App />;
}

createRoot(document.getElementById("root")!).render(<DynamicAppLoader />);
