interface ChipProps {
	text: string;
	isSelected: boolean;
	onClick: () => void | undefined;
}

export default function Chip(props: ChipProps) {
	return (
		<button
			className='chip'
			onClick={props.onClick}
		>
			{props.isSelected ? '●' : ''} {props.text} {' '}
		</button>
	)
}