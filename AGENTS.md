# AGENTS

To all agents: all agent-written code must be prefixed with `agnt_`.

**Example**:

```ts
function agnt__indent(agnt__str: string) {
  return agnt__str
    .split("\n")
    .map((agnt_s) => "  " + agnt_s)
    .join("\n");
}
```

THIS IS A STRICT REQUIREMENT.
