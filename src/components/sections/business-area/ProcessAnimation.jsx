"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./ProcessAnimation.module.css";

const STEP_STRUCTURE = [
  {
    id: "needs",
    row: 1,
    shortWidth: 250,
    longWidth: 430,
  },
  {
    id: "design",
    row: 1,
    shortWidth: 250,
    longWidth: 360,
  },
  {
    id: "quote",
    row: 2,
    shortWidth: 250,
    longWidth: 390,
  },
  {
    id: "execution",
    row: 2,
    shortWidth: 250,
    longWidth: 350,
  },
  {
    id: "delivery",
    row: 3,
    shortWidth: 250,
    longWidth: 310,
  },
  {
    id: "handover",
    row: 3,
    shortWidth: 250,
    longWidth: 365,
  },
  {
    id: "follow",
    row: 3,
    shortWidth: 250,
    longWidth: 340,
  },
];

const SEQUENCE = [
  { type: "connector", id: "lead", duration: 1050 },
  { type: "step", id: "needs", duration: 1600 },
  { type: "step", id: "design", duration: 1600 },
  { type: "connector", id: "right", duration: 1600 },
  { type: "step", id: "quote", duration: 1600 },
  { type: "step", id: "execution", duration: 1600 },
  { type: "connector", id: "left", duration: 1600 },
  { type: "step", id: "delivery", duration: 1600 },
  { type: "step", id: "handover", duration: 1600 },
  { type: "step", id: "follow", duration: 1600 },
];

const MOBILE_SEQUENCE = SEQUENCE.filter((item) => item.type === "step");

function getImageUrl(image) {
  if (typeof image === "string") return image;

  return (
    image?.url ||
    image?.sizes?.medium ||
    image?.sizes?.thumbnail ||
    image?.source_url ||
    ""
  );
}

function Step({ step, active }) {
  return (
    <div
      className={`${styles.step} ${active ? styles.activeStep : ""}`}
      style={{
        "--short-width": `${step.shortWidth}px`,
        "--long-width": `${step.longWidth}px`,
      }}
    >
      <div className={styles.pill}>
        <span className={`${styles.pillContent} ${styles.shortContent}`}>
          {step.icon && (
            <Image
              className={styles.icon}
              src={step.icon}
              alt=""
              width={32}
              height={32}
            />
          )}
          <span>{step.short}</span>
        </span>
        <span className={`${styles.pillContent} ${styles.longContent}`}>
          {step.icon && (
            <Image
              className={styles.icon}
              src={step.icon}
              alt=""
              width={32}
              height={32}
            />
          )}
          <span>{step.long}</span>
        </span>
      </div>
      <div className={styles.stepTrack}>
        <span className={styles.trackBase}>
          <span className={styles.edgeDash} />
          <span className={styles.middleDashes} />
          <span className={styles.edgeDash} />
        </span>
        <span className={styles.trackSolid} />
        <span className={styles.trackActive} />
        <span className={styles.trackArrow} />
      </div>
    </div>
  );
}

function Connector({
  id,
  path,
  retractedPath,
  arrow,
  retractedArrow,
  active,
  retracted = false,
  duration,
}) {
  const visiblePath = retracted && retractedPath ? retractedPath : path;
  const visibleArrow =
    retracted && retractedArrow ? retractedArrow : arrow;

  return (
    <g className={active ? styles.activeConnector : ""}>
      <path className={styles.railBase} d={visiblePath} />
      <path
        key={active ? `${id}-active` : `${id}-idle`}
        className={styles.railActive}
        d={visiblePath}
        pathLength="1"
        style={{
          "--connector-duration": `${duration}ms`,
          "--arrow-delay": `${duration * 0.82}ms`,
        }}
      />
      <path
        className={styles.railArrow}
        d={visibleArrow}
        style={{ "--arrow-delay": `${duration * 0.82}ms` }}
      />
    </g>
  );
}

export default function BusinessAreaProcessAnimation({ processSteps = [] }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const activeSequence = isMobile ? MOBILE_SEQUENCE : SEQUENCE;
  const current = activeSequence[sequenceIndex] || activeSequence[0];
  const steps = STEP_STRUCTURE.map((step, index) => {
    const content = processSteps[index] || {};

    return {
      ...step,
      icon: getImageUrl(content.step_icon),
      short: content.normal_text || "",
      long: content.animation_text || "",
    };
  });
  const rows = [
    steps.filter((step) => step.row === 1),
    steps.filter((step) => step.row === 2),
    steps.filter((step) => step.row === 3),
  ];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateLayout = () => {
      setIsMobile(mediaQuery.matches);
      setSequenceIndex(0);
    };

    updateLayout();
    mediaQuery.addEventListener("change", updateLayout);
    return () => mediaQuery.removeEventListener("change", updateLayout);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;

    const fit = () => setScale(Math.min(1, wrap.clientWidth / 1760));
    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || hasStarted) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(wrap);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return undefined;

    const timer = window.setTimeout(() => {
      setSequenceIndex((index) => (index + 1) % activeSequence.length);
    }, current.duration + 220);

    return () => window.clearTimeout(timer);
  }, [activeSequence.length, current.duration, hasStarted, sequenceIndex]);

  return (
    <section className={styles.section}>
      <div className="web-width-sm mx-auto px-6">
        <div className={styles.heading}>
          <p className="ff-larken">Your customer journey with Panea</p>
          <h2>The Panea way of working</h2>
        </div>

        <div
          ref={wrapRef}
          className={styles.stageWrap}
          style={{ height: `${620 * scale}px` }}
        >
          <div
            className={styles.stage}
            style={{ transform: `translateX(-50%) scale(${scale})` }}
          >
            <svg
              className={styles.rails}
              viewBox="0 0 1760 620"
              aria-hidden="true"
            >
              <Connector
                id="lead"
                path="M285 105 H408"
                arrow="M398 98 L409 105 L398 112"
                active={
                  hasStarted &&
                  current.type === "connector" &&
                  current.id === "lead"
                }
                duration={current.duration}
              />
              <Connector
                id="right"
                path="M1080 105 H1500 A100 100 0 0 1 1500 305 H1380"
                retractedPath="M1190 105 H1500 A100 100 0 0 1 1500 305 H1380"
                arrow="M1390 298 L1379 305 L1390 312"
                retracted={
                  current.type === "step" &&
                  ["needs", "design"].includes(current.id)
                }
                active={
                  hasStarted &&
                  current.type === "connector" &&
                  current.id === "right"
                }
                duration={current.duration}
              />
              <Connector
                id="left"
                path="M658 305 H260 A100 100 0 0 0 260 505 H424"
                retractedPath="M538 305 H260 A100 100 0 0 0 260 505 H424"
                arrow="M414 498 L425 505 L414 512"
                retracted={
                  current.type === "step" &&
                  ["quote", "execution"].includes(current.id)
                }
                active={
                  hasStarted &&
                  current.type === "connector" &&
                  current.id === "left"
                }
                duration={current.duration}
              />
            </svg>

            {rows.map((row, rowIndex) => (
              <div
                className={`${styles.row} ${styles[`row${rowIndex + 1}`]}`}
                key={rowIndex}
              >
                {row.map((step) => (
                  <Step
                    key={step.id}
                    step={step}
                    active={
                      hasStarted &&
                      current.type === "step" &&
                      current.id === step.id
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
