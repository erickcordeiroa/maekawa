-- Dados de catálogo que o sistema exige para funcionar (o seed é só para demonstração
-- e não roda em produção). INSERT IGNORE: não duplica nem altera o que já existe.
INSERT IGNORE INTO `Plan` (`name`, `description`, `priceCents`) VALUES
  ('Mensal', 'Adulto · treinos livres', 15000),
  ('Trimestral', 'Adulto · 3 meses', 13500),
  ('Kids', '4 a 15 anos', 12000);

INSERT IGNORE INTO `ClassGroup` (`slug`, `name`, `startTime`, `position`) VALUES
  ('manha', 'Adulto manhã', '07:00', 0),
  ('kids', 'Kids', '17:30', 1),
  ('noite', 'Adulto noite', '19:00', 2);
