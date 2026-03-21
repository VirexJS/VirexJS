import Footer from "../components/Footer";
import Header from "../components/Header";

/** Default layout wrapping all pages */
export default function Default(props: { children: unknown }) {
	return (
		<div>
			<Header />
			<main style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 16px" }}>
				{props.children}
			</main>
			<Footer />
		</div>
	);
}
