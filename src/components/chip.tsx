interface ChipProps {
	text: string;
	isStarred?: boolean;
	isSelected?: boolean;
	isShaking?: boolean;
	disabled?: boolean;
	onClick?: () => void | undefined;
}

export default function Chip(props: ChipProps) {
	return (
		<button
			className={
				`${props.isSelected ? 'bg-yellow-700'
					: props.isShaking ? 'bg-red-700'
						: props.isStarred ? 'bg-green-800'
							: 'bg-slate-700'} 
				${props.isShaking ? 'shake' : ''}
				rounded-lg
				mr-3 mb-3.5 md:mr-2 md:mb-2 
				px-3 py-1.5 md:px-2.5 md:py-1
				transition duration-300 ease-in-out transform hover:scale-105`
			}
			onClick={props.onClick}
			disabled={props.disabled}
		>
			{props.text}
		</button>
	)
}