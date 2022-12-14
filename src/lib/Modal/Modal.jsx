/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import CloseButton from "./CloseButton";
import useModal from "./Hooks";
import * as scripts from "../scripts/scripts";
import ERRORS from "../scripts/errors";
import "../styles/animations.css";

const Modal = (props) => {
	const {
		isOpen,
		id,
		className,
		theme,
		textColor,
		isDialog,
		whenRender,
		onClose,
		exitOnEscape,
		exitExisting,
		children,
		title,
		header,
		content,
		footer,
		asyncContent,
		animationClose,
		animationDuration,
	} = props;
	const [realContent, setContent] = useState(content || "");
	const { toggleModal } = useModal();

	const portalId = `__thxModals_portal__${id}`;
	if (!document.getElementById(portalId)) {
		const portalContainer = document.createElement("div");
		portalContainer.id = portalId;
		if (props.backgroundStyle !== false) {
			portalContainer.style.position = "absolute";
			portalContainer.style.top = "0";
			portalContainer.style.left = "0";
		}
		document.getElementsByTagName("body")[0].prepend(portalContainer);
	}

	const { closeBtn, closeText } = props;
	const exitOnClick = props.exitOnClick && !isDialog;
	const handleKeyPress = (event) => {
		if (!!event.key && event.key === "Escape") close();
	};
	const handleClick = (event) => {
		if (!!event.target.className.includes("bg-modal")) close();
	};

	useEffect(() => {
		if (!isOpen) return;
		const getAsyncContent = async () => {
			const content = await asyncContent();
			setContent(content);
		};
		if (exitExisting && isOpen) {
			const otherModals = document.querySelectorAll(`.__thxModal__:not(#${id})`);
			if (otherModals.length) {
				for (let i = 0; i < otherModals.length; i++) {
					onClose(otherModals[i].id);
				}
			}
		}

		if (!!asyncContent) getAsyncContent();
		if (exitOnEscape !== false) window.addEventListener("keydown", handleKeyPress);
		if (exitOnClick) window.addEventListener("click", handleClick);
		if (!!whenRender) whenRender();
		return () => {
			if (exitOnEscape !== false) window.removeEventListener("keydown", handleKeyPress);
			if (exitOnClick) window.removeEventListener("click", handleClick);
		};
	}, [realContent, isOpen, exitOnEscape]);

	// Close
	const close = () => {
		const duration = parseInt(animationDuration) || 0;
		if (!!animationClose) {
			const keyFrame = scripts.getAnimationOnClose(animationClose);
			document.getElementById(id).animate(keyFrame, { duration: duration, fill: "both" });
		}
		setTimeout(() => {
			window.removeEventListener("keydown", handleKeyPress);
			window.removeEventListener("click", handleClick);
			onClose(id);
			toggleModal(id);
		}, duration);
	};

	// Styles
	let {
		modalStyle,
		backgroundStyle,
		footerStyle,
		headerStyle,
		contentStyle,
		modalSize,
		height,
		width,
		index,
	} = props;
	if (!modalStyle) modalStyle = {};
	if (!!width) modalStyle.width = width;
	if (!!height) modalStyle.height = height;
	let { bgStyle, modStyle } = scripts.generateStyles(
		theme,
		textColor,
		modalStyle,
		backgroundStyle,
		modalSize
	);

	let closeButton = "";
	if (closeBtn !== false || !!closeText) {
		if (closeBtn !== undefined)
			closeButton = (
				<CloseButton textColor={modStyle.color} close={close}>
					{closeBtn}
				</CloseButton>
			);
		else
			closeButton = <CloseButton textColor={modStyle.color} text={closeText} close={close} />;
	}

	const { animationOpen } = props;
	if (!!animationOpen)
		modStyle.animation = `${animationOpen} ${animationDuration || 500}ms ease-in-out both`;

	const getModal = () => {
		if (!!index) {
			modStyle.zIndex = `${index}`;
		}
		const head = scripts.getHeadContent(title, closeButton);
		return (
			<div
				id={id}
				className={`__thxModal__ ${className || ""}`}
				style={modStyle}
				role="dialog"
				aria-hidden={!isOpen}>
				{head}
				{!!children ? (
					children
				) : (
					<>
						<header style={headerStyle}>{header}</header>
						<div style={contentStyle} role="document">
							{realContent}
						</div>
						<footer style={footerStyle}>{footer}</footer>
					</>
				)}
			</div>
		);
	};
	return (
		isOpen &&
		ReactDOM.createPortal(
			backgroundStyle === false ? (
				getModal()
			) : (
				<div className="bg-modal" style={bgStyle}>
					{getModal()}
				</div>
			),
			document.getElementById(portalId)
		)
	);
};
const colorProp = (props, propName) => {
	if (props[propName]) {
		const regexp = /#[a-zA-Z0-9]{6}/;
		if (props[propName].length !== 7 || !regexp.test(props[propName]))
			return new Error(ERRORS.PROPS.INVALID_COLOR);
	}
};
const animations = {
	open: ["slide-up", "slide-down", "slide-left", "slide-right", "fade-in", "scale-up"],
	close: ["slide-up", "slide-down", "slide-left", "slide-right", "fade-out", "scale-down"],
};

Modal.propTypes = {
	// Require props
	isOpen: PropTypes.oneOfType([PropTypes.bool, PropTypes.any]),
	id: PropTypes.string.isRequired,
	onClose: PropTypes.func.isRequired,

	// Content
	title: PropTypes.string,
	closeText: PropTypes.string,
	header: PropTypes.oneOfType([PropTypes.element, PropTypes.object, PropTypes.string]),
	content: PropTypes.oneOfType([PropTypes.element, PropTypes.object, PropTypes.string]),
	footer: PropTypes.oneOfType([PropTypes.element, PropTypes.object, PropTypes.string]),
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.element),
		PropTypes.object,
		PropTypes.string,
	]),
	closeBtn: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
	className: PropTypes.string,

	// behavior
	exitExisting: PropTypes.bool,
	index: PropTypes.number,
	exitOnEscape: PropTypes.bool,
	isDialog: PropTypes.bool,
	exitOnClick: PropTypes.bool,

	// Callback functions
	asyncContent: PropTypes.func,
	whenRender: PropTypes.func,

	// Style
	theme: colorProp,
	width: PropTypes.string,
	height: PropTypes.string,
	textColor: PropTypes.string,

	backgroundStyle: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
	modalStyle: PropTypes.object,
	modalSize: PropTypes.oneOf(["sm", "md", "xl"]),

	headerStyle: PropTypes.object,
	contentStyle: PropTypes.object,
	footerStyle: PropTypes.object,

	animationOpen: PropTypes.oneOf(animations.open),
	animationClose: PropTypes.oneOf(animations.close),
};
export { useModal };
export default Modal;
