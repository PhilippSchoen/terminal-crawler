export interface Fact {
  safe?: boolean;
  visited?: boolean;
  mayBeDaemon?: boolean;
  mayBeFirewall?: boolean;
  certainDaemon?: boolean;
  certainFirewall?: boolean;
  hasFirewallGlitch?: boolean;
  hasDaemonScan?: boolean;
}
