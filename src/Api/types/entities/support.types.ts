/**
 * Types and interfaces for Support entities.
 * Includes support schedule and contact structures.
 */
export interface SupportSchedule {
	id: number;
	day_range: string;
	hours: string;
	is_closed: boolean;
	notes: string;
}

export interface SupportContact {
	id: number;
	type: string;
	label: string;
	value: string;
	extra_info: string;
	active: boolean;
}
