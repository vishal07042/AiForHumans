"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import scrollama from "scrollama";
import sharedStyles from "../neural-network.module.css";
import styles from "./scroll-story.module.css";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    eyebrow: "Step 1",
    title: "A neuron starts as a weighted opinion",
    body:
      "Three signals enter. Each one gets multiplied by a weight, which is just the model's way of saying how much that signal should matter.",
    takeaway:
      "A neural network is not mystical. It is a pile of weighted sums that gets better at choosing those weights.",
    meta: ["Inputs", "Weights", "Signal strength"],
  },
  {
    eyebrow: "Step 2",
    title: "Everything collapses into one score",
    body:
      "The neuron multiplies inputs by weights, adds them up, and shifts the result with a bias. That gives one raw score before any final decision is made.",
    takeaway:
      "Bias lets the neuron move its threshold without changing the incoming signals.",
    meta: ["Weighted sum", "Bias", "Logit"],
  },
  {
    eyebrow: "Step 3",
    title: "Activation turns raw math into a usable answer",
    body:
      "A sigmoid curve squashes the raw score into a value between 0 and 1. Now the neuron can express confidence instead of an unbounded number.",
    takeaway:
      "Activation functions shape how sharply a neuron reacts and whether it can model non-linear decisions.",
    meta: ["Sigmoid", "Confidence", "Non-linearity"],
  },
  {
    eyebrow: "Step 4",
    title: "Hidden layers build richer pattern detectors",
    body:
      "One neuron can only make a simple cut. Multiple layers let the network combine smaller patterns into larger features and carve out complex boundaries.",
    takeaway:
      "Depth matters because each layer can reuse the previous layer's abstractions.",
    meta: ["Feature stacks", "Hidden layers", "Composition"],
  },
  {
    eyebrow: "Step 5",
    title: "Learning starts with being wrong",
    body:
      "The model predicts, compares that guess with the target, and measures error. That error is the signal that tells the network what needs to change.",
    takeaway:
      "No correction signal, no learning. Training is just repeated guessing plus feedback.",
    meta: ["Prediction", "Target", "Error"],
  },
  {
    eyebrow: "Step 6",
    title: "Gradient descent adjusts the knobs",
    body:
      "Backpropagation tells each weight which direction reduces the error. Gradient descent then nudges those values a little at a time toward a better configuration.",
    takeaway:
      "Training is many small corrections, not one giant leap to the perfect answer.",
    meta: ["Gradients", "Updates", "Loss curve"],
  },
  {
    eyebrow: "Step 7",
    title: "After training, inference is just a fast forward pass",
    body:
      "Once the weights settle into a useful configuration, the network can take a fresh input and run the same chain of math to produce a confident output.",
    takeaway:
      "Inference is the cheap part. Most of the real work happened during training.",
    meta: ["Forward pass", "Confidence", "Generalization"],
  },
];

const SIGNALS = [
  { label: "Doorbell", color: "#4a9eff", value: 0.92 },
  { label: "Food smell", color: "#5ec784", value: 0.71 },
  { label: "3AM chaos", color: "#ff7eb3", value: 0.18 },
];

const WEIGHTS = [
  { label: "w1", color: "#4a9eff", value: 0.82 },
  { label: "w2", color: "#5ec784", value: 0.56 },
  { label: "w3", color: "#ff7eb3", value: -0.38 },
];

function NetworkSvg({ emphasizeLayers = false }) {
  const columns = [
    { x: 84, color: "#4a9eff", nodes: [54, 114, 174] },
    { x: 228, color: "#b48fff", nodes: emphasizeLayers ? [40, 88, 136, 184] : [70, 158] },
    { x: 372, color: "#5ec784", nodes: emphasizeLayers ? [56, 114, 172] : [114] },
    { x: 516, color: "#f5a623", nodes: [114] },
  ];

  const lines = [];
  for (let i = 0; i < columns.length - 1; i += 1) {
    columns[i].nodes.forEach((startY) => {
      columns[i + 1].nodes.forEach((endY) => {
        lines.push({
          x1: columns[i].x,
          y1: startY,
          x2: columns[i + 1].x,
          y2: endY,
          color: columns[i].color,
        });
      });
    });
  }

  return (
    <svg
      viewBox="0 0 600 228"
      className={styles.networkSvg}
      role="img"
      aria-label="Neural network diagram"
    >
      {lines.map((line, index) => (
        <line
          key={`${line.x1}-${line.y1}-${index}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={line.color}
          strokeOpacity="0.26"
          strokeWidth="1.6"
        />
      ))}
      {columns.map((column) =>
        column.nodes.map((y) => (
          <circle
            key={`${column.x}-${y}`}
            cx={column.x}
            cy={y}
            r="16"
            fill="#141418"
            stroke={column.color}
            strokeWidth="2"
          />
        )),
      )}
    </svg>
  );
}

function SigmoidCurve() {
  return (
    <div className={styles.curveBox}>
      <svg viewBox="0 0 520 260" role="img" aria-label="Sigmoid curve">
        <defs>
          <linearGradient id="curveStroke" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#4a9eff" />
            <stop offset="100%" stopColor="#f5a623" />
          </linearGradient>
        </defs>
        <line x1="42" y1="214" x2="486" y2="214" stroke="rgba(255,255,255,0.16)" />
        <line x1="262" y1="32" x2="262" y2="228" stroke="rgba(255,255,255,0.12)" />
        <path
          d="M 54 202 C 118 202, 152 202, 210 176 C 240 162, 248 134, 262 130 C 286 122, 296 86, 324 66 C 372 32, 418 30, 470 30"
          fill="none"
          stroke="url(#curveStroke)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx="310" cy="88" r="10" fill="#f5a623" />
      </svg>
    </div>
  );
}

function LossCurve() {
  return (
    <svg viewBox="0 0 520 220" role="img" aria-label="Loss decreasing over time">
      <line x1="36" y1="190" x2="492" y2="190" stroke="rgba(255,255,255,0.16)" />
      <line x1="36" y1="28" x2="36" y2="190" stroke="rgba(255,255,255,0.16)" />
      <path
        d="M 46 56 C 98 62, 116 76, 148 102 C 198 140, 248 154, 296 164 C 344 174, 388 178, 474 182"
        fill="none"
        stroke="#e8593c"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="474" cy="182" r="9" fill="#f5a623" />
    </svg>
  );
}

function StoryScene({ stepIndex }) {
  return (
    <>
      <div className={styles.ambientOrb} aria-hidden="true" />
      <div className={styles.ambientOrbSecondary} aria-hidden="true" />

      <section className={styles.sceneCard}>
        {stepIndex === 0 && (
          <div className={styles.networkShell}>
            <div className={styles.visualHeadline}>
              <div>
                <h3>Signals enter the neuron</h3>
                <p>Each input carries intensity. The weights decide which ones matter.</p>
              </div>
              <div className={styles.metricPill}>3 inputs to 1 neuron</div>
            </div>
            <div className={styles.signalGrid}>
              {SIGNALS.map((signal, index) => (
                <div className={styles.signalRow} key={signal.label}>
                  <span className={styles.signalLabel}>{signal.label}</span>
                  <div className={styles.signalTrack}>
                    <div
                      className={styles.signalFill}
                      style={{
                        width: `${signal.value * 100}%`,
                        background: `linear-gradient(90deg, ${signal.color}, rgba(255,255,255,0.18))`,
                      }}
                    />
                  </div>
                  <span className={styles.signalValue}>
                    {signal.value.toFixed(2)} x {WEIGHTS[index].value.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <NetworkSvg />
          </div>
        )}

        {stepIndex === 1 && (
          <div className={styles.networkShell}>
            <div className={styles.visualHeadline}>
              <div>
                <h3>Weighted sum + bias</h3>
                <p>The neuron turns multiple signals into a single raw score.</p>
              </div>
              <div className={styles.metricPill}>logit = 0.93</div>
            </div>
            <div className={styles.equationRow}>
              <div className={styles.equationCell}>
                <strong>0.92</strong>
                <span>x1 x w1</span>
              </div>
              <div className={styles.equationCell}>
                <strong>0.40</strong>
                <span>x2 x w2</span>
              </div>
              <div className={styles.equationCell}>
                <strong>-0.07</strong>
                <span>x3 x w3</span>
              </div>
              <div className={styles.equationCell}>
                <strong>+0.18</strong>
                <span>bias</span>
              </div>
            </div>
            <br />
            <br />
            <br />
            <div className={styles.stackCard}>
              <span className={styles.labelMuted}>Raw score before activation</span>
              <div className={styles.verdictValue}>0.93</div>
            </div>
            <NetworkSvg />
          </div>
        )}

        {stepIndex === 2 && (
          <div className={styles.sigmoidShell}>
            <div className={styles.visualHeadline}>
              <div>
                <h3>Sigmoid squeezes the output</h3>
                <p>The score becomes a bounded confidence value between 0 and 1.</p>
              </div>
              <div className={styles.metricPill}>sigma(0.93) = 0.72</div>
            </div>
            <SigmoidCurve />
            <div className={styles.outputBadgeRow}>
              <div className={styles.outputBadge}>
                <span className={styles.labelMuted}>Low confidence</span>
                <strong>0.12</strong>
              </div>
              <div className={styles.outputBadge}>
                <span className={styles.labelMuted}>Threshold</span>
                <strong>0.50</strong>
              </div>
              <div className={styles.outputBadge}>
                <span className={styles.labelMuted}>Current output</span>
                <strong>0.72</strong>
              </div>
            </div>
          </div>
        )}

        {stepIndex === 3 && (
          <div className={styles.networkShell}>
            <div className={styles.visualHeadline}>
              <div>
                <h3>Layers compound simple features</h3>
                <p>Early neurons react to fragments. Later ones combine them into a decision.</p>
              </div>
              <div className={styles.metricPill}>4 layers in play</div>
            </div>
            <NetworkSvg emphasizeLayers />
            <div className={styles.errorGrid}>
              <div className={styles.stackCard}>
                <span className={styles.labelMuted}>Layer 1</span>
                <p>Local detectors: edges, loudness, intensity, motion.</p>
              </div>
              <div className={styles.stackCard}>
                <span className={styles.labelMuted}>Layer 2+</span>
                <p>Composite patterns: shape, object, sequence, category.</p>
              </div>
            </div>
          </div>
        )}

        {stepIndex === 4 && (
          <div className={styles.networkShell}>
            <div className={styles.visualHeadline}>
              <div>
                <h3>Error is the teaching signal</h3>
                <p>The model only improves because it can compare what it guessed with what should have happened.</p>
              </div>
              <div className={styles.metricPill}>error = 0.19</div>
            </div>
            <div className={styles.errorGrid}>
              <div className={styles.stackCard}>
                <span className={styles.labelMuted}>Prediction</span>
                <div className={styles.verdictValue} style={{ color: "#f5a623" }}>
                  0.72
                </div>
                <p>Model thinks the neuron should fire.</p>
              </div>
              <div className={styles.stackCard}>
                <span className={styles.labelMuted}>Target</span>
                <div className={styles.verdictValue} style={{ color: "#4a9eff" }}>
                  0.91
                </div>
                <p>Ground truth says the output should be stronger.</p>
              </div>
            </div>
            <div className={styles.footerNote}>
              Loss functions turn this difference into a number the optimizer can minimize.
            </div>
          </div>
        )}

        {stepIndex === 5 && (
          <div className={styles.lossShell}>
            <div className={styles.visualHeadline}>
              <div>
                <h3>Gradients nudge weights downhill</h3>
                <p>Each update is small, directional, and tied to how much a weight contributed to the error.</p>
              </div>
              <div className={styles.metricPill}>loss 0.68 to 0.09</div>
            </div>
            <div className={styles.lossCard}>
              <LossCurve />
            </div>
            <div className={styles.weightList}>
              {WEIGHTS.map((weight) => {
                const magnitude = Math.abs(weight.value);
                const positive = weight.value >= 0;
                return (
                  <div className={styles.weightRow} key={weight.label}>
                    <span>{weight.label}</span>
                    <div className={styles.weightTrack}>
                      <div
                        className={styles.weightFill}
                        style={{
                          width: `${magnitude * 50}%`,
                          left: positive ? "50%" : `calc(50% - ${magnitude * 50}%)`,
                          background: weight.color,
                        }}
                      />
                    </div>
                    <span className={styles.signalValue}>{weight.value.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {stepIndex === 6 && (
          <div className={styles.finalGrid}>
            <div className={styles.visualHeadline}>
              <div>
                <h3>Inference reuses the trained weights</h3>
                <p>Same forward pass, new inputs. The model now reacts with a useful confidence score.</p>
              </div>
              <div className={styles.metricPill}>confidence = 94%</div>
            </div>
            <div className={styles.verdictCard}>
              <span className={styles.labelMuted}>Model verdict</span>
              <div className={styles.verdictValue} style={{ color: "#5ec784" }}>
                0.94
              </div>
              <p>Strong activation. The network has learned a stable pattern.</p>
            </div>
            <div className={styles.footerNote}>
              This is why training is expensive but inference feels instant: the hard part was finding the weights.
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default function NeuralNetworkScrollStory() {
  const storyRef = useRef(null);
  const sceneRefs = useRef([]);
  const [activeStep, setActiveStep] = useState(0);

  const handleStepEnter = useEffectEvent(({ index }) => {
    setActiveStep(index);
  });

  useEffect(() => {
    const scroller = scrollama();
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const setupScrollama = () => {
      const mobile = window.innerWidth < 760;
      scroller
        .setup({
          step: "[data-scroll-step]",
          offset: mobile ? "120px" : 0.58,
          progress: false,
        })
        .onStepEnter(handleStepEnter);
    };

    const ctx = gsap.context(() => {
      if (!prefersReducedMotion.matches) {
        gsap.to(`.${styles.ambientOrb}`, {
          yPercent: -18,
          xPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: storyRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });

        gsap.to(`.${styles.ambientOrbSecondary}`, {
          yPercent: 18,
          xPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: storyRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
    }, storyRef);

    setupScrollama();

    const handleResize = () => {
      scroller.resize();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ctx.revert();
      scroller.destroy();
    };
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    sceneRefs.current.forEach((scene, index) => {
      if (!scene) {
        return;
      }

      gsap.to(scene, {
        autoAlpha: index === activeStep ? 1 : 0,
        y: index === activeStep ? 0 : 18,
        scale: index === activeStep ? 1 : 0.98,
        duration: prefersReducedMotion ? 0 : 0.55,
        ease: "power3.out",
        overwrite: true,
      });
    });
  }, [activeStep]);

  return (
    <div className={styles.storyRoot} ref={storyRef}>
      <section className={styles.storyIntro}>
        {/* <div className={styles.introCard}>
          <p className={sharedStyles.eyebrow}>Narrative Mode</p>
          <h2 className={styles.introTitle}>Scroll through the network, one idea at a time.</h2>
          <p className={styles.introBody}>
            This version turns the neural network article into a sticky visual
            explainer. The left column controls pacing. The right column keeps
            the visual state locked in place so each section changes one concept
            instead of forcing the reader to decode everything at once.
          </p>
          <div className={styles.principles}>
            <div className={styles.principle}>
              <strong>Short text blocks</strong>
              One idea per scroll step keeps the reader oriented.
            </div>
            <div className={styles.principle}>
              <strong>Sticky visual context</strong>
              The diagram stays put while the explanation evolves.
            </div>
            <div className={styles.principle}>
              <strong>Motion only where it clarifies</strong>
              GSAP handles transitions and parallax, not the core reading flow.
            </div>
          </div>
        </div> */}
        {/* <aside className={styles.researchCard}>
          <h3 className={styles.researchTitle}>What informed this structure</h3>
          <ul className={styles.researchList}>
            <li>
              <strong>Scrollama</strong>
              Its setup is built around step-based scrollytelling, which fits a
              sticky narrative column well.
            </li>
            <li>
              <strong>GSAP ScrollTrigger</strong>
              Scrubbed animations work best as a visual enhancement, not as a
              replacement for content structure.
            </li>
            <li>
              <strong>Scrollytelling best practice</strong>
              Effective stories keep the prose linear and the interactive state
              tightly scoped to the current section.
            </li>
          </ul>
        </aside> */}
      </section>

      <section className={styles.storyboard}>
        <div className={styles.storyboardHeader}>
          <span className={styles.storyboardLabel}>Story beats</span>
          <span className={styles.progressText}>
            Step {activeStep + 1} of {STEPS.length}
          </span>
        </div>
        <div className={styles.storyboardTrack}>
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className={`${styles.storyboardStep} ${
                index === activeStep ? styles.storyboardStepActive : ""
              }`}
            >
              <div className={styles.storyboardStepIndex}>{index + 1}</div>
              <div className={styles.storyboardStepTitle}>{step.title}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.storyGrid}>
        <div className={styles.stepsColumn}>
          {STEPS.map((step) => (
            <article key={step.title} className={styles.step} data-scroll-step>
              <span className={styles.stepEyebrow}>{step.eyebrow}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepBody}>{step.body}</p>
              <div className={styles.stepTakeaway}>
                <span className={styles.stepTakeawayLabel}>Why it matters</span>
                {step.takeaway}
              </div>
              <div className={styles.stepMeta}>
                {step.meta.map((item) => (
                  <span key={`${step.title}-${item}`}>{item}</span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <aside className={styles.visualShell}>
          <div className={styles.visualInner}>
            <div className={styles.progressMeta}>
              <div className={styles.progressText}>{STEPS[activeStep].title}</div>
              <div className={styles.progressBar} aria-hidden="true">
                <div
                  className={styles.progressFill}
                  style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            <div className={styles.visualStage}>
              {STEPS.map((step, index) => (
                <div
                  key={step.title}
                  ref={(node) => {
                    sceneRefs.current[index] = node;
                  }}
                  className={`${styles.sceneLayer} ${
                    index === activeStep ? styles.activeScene : ""
                  }`}
                >
                  <StoryScene stepIndex={index} />
                </div>
              ))}
            </div>

            
          </div>
        </aside>
      </section>
    </div>
  );
}
