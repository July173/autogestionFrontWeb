export interface LegalDocument {
	id: number;
	type: string;
	title: string;
	effective_date: string;
	last_update: string;
	active: boolean;
}

export interface LegalSection {
	id: number;
	order: number;
	code: string;
	title: string;
	content: string;
	active: boolean;
	document: number;
	parent: number | null;
}
