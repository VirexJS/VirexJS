import Header from "../components/Header";
import Footer from "../components/Footer";

/** Default layout wrapping all pages */
export default function Default(props: { children: unknown }) {
	return (
		<div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 16px" }}>
			<Header />
			<main style={{ padding: "24px 0" }}>
				{props.children}
			</main>
			<Footer />
		</div>
	);
}
