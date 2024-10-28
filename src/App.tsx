import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Abastecimento {
  data: string;
  valor: number;
  tickets: number;
}

interface Registro {
  nome: string;
  whatsapp: string;
  placa: string;
  abastecimentos: Abastecimento[];
  totalTickets: number;
}

const formatarMoeda = (valor: number): string => {
  return valor.toLocaleString("'pt-BR'", {
    style: "currency",
    currency: "'BRL'",
  });
};

const parseMoeda = (valor: string): number => {
  return Number(valor.replace(/[^\d,]/g, "").replace("','", "'.'"));
};

export default function CadastroAbastecimentoComponent() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [placa, setPlaca] = useState("");
  const [valor, setValor] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());
  const registrosPorPagina = 5;

  const calcularTickets = (valor: number): number => {
    return Math.floor(valor / 50);
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    setValor(rawValue);
  };

  const handleValorBlur = () => {
    if (valor) {
      const numberValue = Number(valor) / 100;
      setValor(formatarMoeda(numberValue));
    }
  };

  const handleValorFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (valor.startsWith("R$")) {
      const numericValue = valor.replace(/\D/g, "");
      setValor(numericValue);
    }
    // Mova o cursor para o final do input
    e.target.setSelectionRange(e.target.value.length, e.target.value.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valorNumerico = valor.includes("R$")
      ? parseMoeda(valor)
      : Number(valor) / 100;
    const novoAbastecimento: Abastecimento = {
      data: new Date().toLocaleString("pt-BR"),
      valor: valorNumerico,
      tickets: calcularTickets(valorNumerico),
    };

    setRegistros((prevRegistros) => {
      const registroExistente = prevRegistros.findIndex(
        (r) => r.placa === placa
      );
      if (registroExistente !== -1) {
        // Atualiza o registro existente
        const novosRegistros = [...prevRegistros];
        const registroAtualizado = {
          ...novosRegistros[registroExistente],
          nome, // Atualiza o nome caso tenha mudado
          whatsapp, // Atualiza o WhatsApp caso tenha mudado
          abastecimentos: [
            ...novosRegistros[registroExistente].abastecimentos,
            novoAbastecimento,
          ],
        };
        registroAtualizado.totalTickets =
          registroAtualizado.abastecimentos.reduce(
            (total, ab) => total + ab.tickets,
            0
          );
        novosRegistros[registroExistente] = registroAtualizado;
        return novosRegistros;
      } else {
        // Cria um novo registro
        return [
          ...prevRegistros,
          {
            nome,
            whatsapp,
            placa,
            abastecimentos: [novoAbastecimento],
            totalTickets: novoAbastecimento.tickets,
          },
        ];
      }
    });

    setNome("");
    setWhatsapp("");
    setPlaca("");
    setValor("");
  };

  const toggleExpand = (index: number) => {
    setExpandidos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const indexUltimoRegistro = paginaAtual * registrosPorPagina;
  const indexPrimeiroRegistro = indexUltimoRegistro - registrosPorPagina;
  const registrosAtuais = registros.slice(
    indexPrimeiroRegistro,
    indexUltimoRegistro
  );

  const numeroPaginas = Math.ceil(registros.length / registrosPorPagina);

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cadastro de Abastecimento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">Número do WhatsApp</Label>
              <Input
                id="whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="placa">Placa do Carro</Label>
              <Input
                id="placa"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="valor">Valor de Abastecimento</Label>
              <Input
                id="valor"
                value={valor}
                onChange={handleValorChange}
                onBlur={handleValorBlur}
                onFocus={handleValorFocus}
                placeholder="R$ 0,00"
                inputMode="numeric"
                required
              />
            </div>
            <Button type="submit">Cadastrar</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registros de Abastecimento</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Ticket</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrosAtuais.map((registro, index) => (
                <>
                  <TableRow key={index}>
                    <TableCell>{registro.nome}</TableCell>
                    <TableCell>{registro.whatsapp}</TableCell>
                    <TableCell>{registro.placa}</TableCell>
                    <TableCell>{registro.totalTickets}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        onClick={() => toggleExpand(index)}
                      >
                        {expandidos.has(index) ? (
                          <ChevronUp />
                        ) : (
                          <ChevronDown />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandidos.has(index) && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className="p-4 bg-muted">
                          <h4 className="font-semibold mb-2">
                            Histórico de Abastecimentos:
                          </h4>
                          <ul className="space-y-2">
                            {registro.abastecimentos.map(
                              (abastecimento, abIndex) => (
                                <li key={abIndex}>
                                  {abastecimento.data}:{" "}
                                  {formatarMoeda(abastecimento.valor)} -
                                  Tickets: {abastecimento.tickets}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
            disabled={paginaAtual === 1}
          >
            Anterior
          </Button>
          <span>
            Página {paginaAtual} de {numeroPaginas}
          </span>
          <Button
            onClick={() =>
              setPaginaAtual((prev) => Math.min(prev + 1, numeroPaginas))
            }
            disabled={paginaAtual === numeroPaginas}
          >
            Próxima
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
