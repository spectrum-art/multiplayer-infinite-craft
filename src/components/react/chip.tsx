interface ChipProps {
	text: string;
	isSelected: boolean;
	onClick: () => void | undefined;
	isShaking?: boolean;
	disabled?: boolean;
}

export default function Chip(props: ChipProps) {
	return (
		<button
			className={`${props.isSelected ? 'bg-yellow-700' : 'bg-slate-700'} 
			${props.isShaking ? 'shake' : ''}
			mr-2 mb-1.5 px-2 py-0.5
			transition duration-300 ease-in-out transform hover:scale-105`}
			onClick={props.onClick}
			disabled={props.disabled}
		>
			{props.text}
		</button>
	)
}